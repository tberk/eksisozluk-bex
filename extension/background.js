// ekşi only allows one deletion every 30 seconds, so the queue is drained by an
// alarm. Service workers are stopped when idle: all state lives in storage.

const ALARM = 'delete-next'
const PERIOD_MS = 31 * 1000
const MAX_ATTEMPTS = 3
const EKSI_URLS = chrome.runtime.getManifest().host_permissions

const DEFAULT_STATE = {
  queue: [], // entry ids waiting to be deleted, oldest first
  deleted: [], // entry ids deleted so far
  failed: [], // entry ids that failed MAX_ATTEMPTS times
  attempts: {}, // entry id -> failed attempt count
  paused: false,
  waitingForTab: false, // true when the last run found no usable ekşi tab
  origin: 'https://eksisozluk.com', // origin of the last tab used, for popup links
  lastAttemptAt: 0, // when a delete request was last sent, to respect the rate limit
}

async function getState() {
  return { ...DEFAULT_STATE, ...(await chrome.storage.local.get(Object.keys(DEFAULT_STATE))) }
}

// Run read-modify-write updates one at a time so they never overwrite each other
let pending = Promise.resolve()
function update(fn) {
  const run = pending.then(async () => {
    const state = await getState()
    const result = fn(state)
    await chrome.storage.local.set(state)
    await syncAlarm(state)
    return result
  })
  pending = run.catch(() => {})
  return run
}

async function syncAlarm(state) {
  const active = state.queue.length > 0 && !state.paused
  const alarm = await chrome.alarms.get(ALARM)

  if (active && !alarm) {
    const minutes = PERIOD_MS / 60_000
    await chrome.alarms.create(ALARM, { delayInMinutes: minutes, periodInMinutes: minutes })
    // Starting (or resuming): try right away instead of waiting for the first alarm
    setTimeout(deleteNext, 0)
  }
  else if (!active && alarm) {
    await chrome.alarms.clear(ALARM)
  }
}

// Runs in the page (MAIN world) so the site's own jQuery sends the session and CSRF token
function deleteInPage(id) {
  return new Promise((resolve) => {
    if (typeof window.$?.post !== 'function')
      return resolve({ ok: false, retry: true })

    window.$.post('/entry/sil', { id })
      .done(() => resolve({ ok: true }))
      .fail(xhr => resolve({ ok: false, status: xhr.status }))
  })
}

function toastInPage(message) {
  window.ek$i?.success?.(message)
}

function toast(tabId, message) {
  chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: toastInPage,
    args: [message],
  }).catch(() => {})
}

async function findTabs() {
  const tabs = await chrome.tabs.query({ url: EKSI_URLS })
  return tabs.filter(tab => tab.status === 'complete' && !tab.discarded)
}

let running = false
async function deleteNext() {
  if (running)
    return
  running = true

  try {
    const state = await getState()
    const id = state.queue[0]
    // The rate limit check also stops an immediate try right after a recent deletion
    if (state.paused || id === undefined || Date.now() - state.lastAttemptAt < PERIOD_MS)
      return

    for (const tab of await findTabs()) {
      let result
      try {
        const [injection] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          world: 'MAIN',
          func: deleteInPage,
          args: [id],
        })
        result = injection?.result
      }
      catch {
        continue // tab navigated away or is not scriptable
      }

      // Page wasn't usable (e.g. still loading scripts): try another tab
      if (!result || result.retry)
        continue

      const origin = new URL(tab.url).origin
      const outcome = await update(s => recordResult(s, id, result.ok, origin))
      toast(tab.id, {
        deleted: `#${id} nolu entry başarıyla silindi.`,
        retry: `#${id} nolu entry silinemedi, daha sonra tekrar denenecek.`,
        failed: `#${id} nolu entry ${MAX_ATTEMPTS} denemede silinemedi, listeden çıkarıldı.`,
      }[outcome])
      return
    }

    await update((s) => { s.waitingForTab = true })
  }
  finally {
    running = false
  }
}

function recordResult(state, id, ok, origin) {
  state.waitingForTab = false
  state.origin = origin
  state.lastAttemptAt = Date.now()
  state.queue = state.queue.filter(e => e !== id)

  if (ok) {
    delete state.attempts[id]
    if (!state.deleted.includes(id))
      state.deleted.push(id)
    return 'deleted'
  }

  const attempts = (state.attempts[id] ?? 0) + 1
  if (attempts >= MAX_ATTEMPTS) {
    delete state.attempts[id]
    if (!state.failed.includes(id))
      state.failed.push(id)
    return 'failed'
  }

  // Move to the back so one bad entry doesn't block the rest
  state.attempts[id] = attempts
  state.queue.push(id)
  return 'retry'
}

function addEntries(state, ids) {
  let added = 0
  for (const id of ids) {
    if (!Number.isInteger(id) || id <= 0 || state.queue.includes(id) || state.deleted.includes(id))
      continue
    state.queue.push(id)
    state.failed = state.failed.filter(e => e !== id)
    added++
  }
  return added
}

const handlers = {
  async add({ ids }, sender) {
    const added = await update(s => addEntries(s, ids))
    if (sender.tab) {
      const message = ids.length === 1
        ? (added ? 'silme listesine eklendi.' : 'entry zaten silme listesinde.')
        : `${added} entry silme listesine eklendi.`
      toast(sender.tab.id, message)
    }
    return { added }
  },
  clear: () => update((s) => { s.queue = []; s.attempts = {} }),
  setPaused: ({ paused }) => update((s) => { s.paused = paused }),
  retryFailed: () => update((s) => { s.queue.push(...s.failed); s.failed = [] }),
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handler = handlers[message?.type]
  if (!handler)
    return false

  Promise.resolve(handler(message, sender)).then(sendResponse, (error) => {
    console.error(error)
    sendResponse({ error: String(error) })
  })
  return true // keep the channel open for the async response
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM)
    deleteNext()
})

// v2 stored both lists as JSON strings under different keys
async function migrateFromV2() {
  const old = await chrome.storage.local.get(['entries', 'deletedEntries', 'webext-demo'])
  const parse = (value) => {
    try {
      const list = JSON.parse(value ?? '[]')
      return Array.isArray(list) ? list.map(Number) : []
    }
    catch {
      return []
    }
  }

  await update((s) => {
    addEntries(s, parse(old.entries))
    for (const id of parse(old.deletedEntries)) {
      if (!s.deleted.includes(id))
        s.deleted.push(id)
    }
  })
  await chrome.storage.local.remove(['entries', 'deletedEntries', 'webext-demo'])
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'update')
    migrateFromV2()
})

// Alarms aren't guaranteed to survive a browser restart; recreate on every wake-up
getState().then(syncAlarm)
