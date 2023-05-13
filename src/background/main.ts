import { onMessage, sendMessage } from 'webext-bridge/background'
import { addDeletedEntry, addEntry, getList, removeEntry, saveList } from '~/logic/entries'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('ek$i entry silici yüklendi.')
})

// Periodically check entries to be deleted
let intervalId: null | NodeJS.Timer = null

setInterval(async () => {
  const list = await getList()

  if (list.length > 0 && !intervalId)
    startInterval()

  if (list.length === 0 && intervalId)
    stopInterval()
}, 3 * 1000)

function startInterval() {
  checkList()

  intervalId = setInterval(() => {
    checkList()
  }, 31 * 1000)
}

function stopInterval() {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Keep last eksisozluk tab id
let lastTabId: undefined | number

onMessage('set-tab-id', async ({ sender }) => {
  lastTabId = sender.tabId
})

onMessage('add-entry', async ({ data, sender }) => {
  const id = data?.id as number
  const list = await getList()

  // Check
  if (list.includes(id)) {
    showUIMessage('entry silme sırasında.', sender.tabId)
    return
  }

  // Add to list
  addEntry(id)
  showUIMessage('silme listesine eklendi.', sender.tabId)
})

onMessage('entry-delete-success', async ({ data }) => {
  const id = data.id as number

  // Remove from deletion list
  removeEntry(id)

  // Add to deleted list
  addDeletedEntry(id)
})

onMessage('entry-delete-fail', async ({ data }) => {
  // const id = data.id as number
  const list = await getList()

  if (list.length < 2)
    return

  const first = list.shift() as number
  list.push(first)

  saveList(list)
})

function showUIMessage(msg: string, id: number) {
  sendMessage('bg-ui-msg', { message: msg }, { context: 'content-script', tabId: id })
}

async function checkList() {
  if (!lastTabId) {
    // eslint-disable-next-line no-console
    console.log('no tabs open')
    return
  }

  const list = await getList()

  if (list === undefined || list.length === 0) {
    // eslint-disable-next-line no-console
    console.log('No need for further action. List is empty.')
    return
  }

  const entryId = list[0]

  //
  if (entryId === null) {
    // eslint-disable-next-line no-console
    console.log('id null')
    return
  }

  sendMessage('delete-entry', { id: entryId }, { context: 'content-script', tabId: lastTabId })
}
