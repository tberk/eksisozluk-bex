import { onMessage, sendMessage } from 'webext-bridge/content-script'
// import { createApp } from 'vue'
// import App from './views/App.vue'
// import { setupApp } from '~/logic/common-setup'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  // console.info('[vitesse-webext] Hello world from content script')
  // communication example: send previous tab title from background page
  /*
  onMessage('tab-prev', ({ data }) => {
    console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
  })
   */

  // Initialize extension
  initEk$iSilici()

  // Listens from background js
  onMessage('bg-ui-msg', ({ data }) => {
    showMsg(data?.message)
  })

  onMessage('delete-entry', ({ data }) => {
    const entryId = data.id as number

    deleteEntry(entryId)
  })

  // Listens from eksiScript
  window.addEventListener('message', (event) => {
    // We only accept messages from ourselves
    if (event.source !== window || !event.data.type)
      return

    // On successfull delete
    if (event.data.type === 'ENTRY_DELETE_SUCCESS') {
      showMsg(`${event.data.id} nolu entry ba$arıyla silindi.`)

      sendMessage('entry-delete-success', { id: event.data.id })
    }
    // On failed delete
    else if (event.data.type === 'ENTRY_DELETE_FAIL') {
      console.warn(`delete fail ${event.data.id}`)

      sendMessage('entry-delete-fail', { id: event.data.id })
    }
  }, false)

  // mount component to context window
  /* no need for context window (injects App.vue)
  const container = document.createElement('div')
  container.id = __NAME__
  const root = document.createElement('div')
  const styleEl = document.createElement('link')
  const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)
  document.body.appendChild(container)
  const app = createApp(App)
  setupApp(app)
  app.mount(root)
   */
})()

function initEk$iSilici() {
  // Inject content hooks
  injectEk$i()

  // Set tab id
  sendMessage('set-tab-id', {})

  // UI
  window.onload = function () {
    setTimeout(createSubMenuItems, 1000)

    createDeleteAllButton()

    detectChanges()
  }
}

function injectEk$i() {
  const th = document.getElementsByTagName('body')[0]
  const s = document.createElement('script')
  s.setAttribute('type', 'text/javascript')
  s.setAttribute('src', browser.runtime.getURL('assets/eksiScript.js'))
  th.appendChild(s)
}

function showMsg(msg: string) {
  window.postMessage({ type: 'FROM_CONTENT_SCRIPT_UI_MESSAGE', text: msg }, '*')
}

function deleteEntry(id: number) {
  window.postMessage({ type: 'FROM_CONTENT_SCRIPT_DELETE', id }, '*')
}

function createSubMenuItems() {
  const uls = document.querySelectorAll('ul.dropdown-menu.right.toggles-menu')

  for (let i = 0; i < uls.length; i++) {
    const ul = uls[i] as HTMLUListElement
    const id = getEntryIdFromUL(ul)

    if (id === null)
      continue

    // Create custom menu item
    const label = 'silme listesine ekle'

    // Added before?
    if (ul.innerText.search(label) !== -1)
      continue

    const a = document.createElement('a')
    a.classList.add('add-entry-to-delete-list')
    a.innerText = label
    a.style.fontWeight = 'bold'
    const li = document.createElement('li')
    li.appendChild(a)
    uls[i].appendChild(li)

    // Add click listener
    li.addEventListener('click', () => {
      addEntryToList(id)
    })
  }
}

// Add entry to list to be deleted
function addEntryToList(id: number) {
  // Hide menu
  document.body.click()

  // Send job to background
  sendMessage('add-entry', { id })
}

// Gets entry id from ul menu
function getEntryIdFromUL(ul: HTMLUListElement): number | null {
  const links = ul.getElementsByTagName('a')

  for (let i = 0, max = links.length; i < max; i++) {
    const link = links[i]

    if (link.href.includes('duzelt')) {
      const parts = link.href.split('/')

      if (parts.length > 1)
        return parseInt(parts[parts.length - 1])
    }
  }

  return null
}

function detectChanges() {
  const targetNode = document.getElementById('profile-stats-section-content')

  if (targetNode) {
    const config = { attributes: false, childList: true, subtree: false }

    const callback = function (mutationsList, observer) {
      for (const mutation of mutationsList) {
        if (mutation.type === 'childList')
          createSubMenuItems()
      }
    }

    const observer = new MutationObserver(callback)
    observer.observe(targetNode, config)
  }
}

/*
 * Delete all entries
 */
function createDeleteAllButton() {
  // Own profile?
  const check = document.getElementById('btnmsg')
  if (check)
    return

  // Create button
  const button = document.createElement('button')
  button.classList.add('primary')
  button.innerText = 'tüm entry\'leri silme listesine ekle'
  button.id = 'delete-all-entries'

  // Append button
  const profileSection = document.getElementById('profile-stats-section-content')
  document.getElementById('profile-stats-sections')?.insertBefore(button, profileSection)

  // Add listener
  button.addEventListener('click', () => {
    const r = confirm('tüm entry\'lerini silmek istediğine emin misin? başka bir deyişle, yolun açık olsun mu paşam?')
    if (r === true) {
      alert('işlem başlıyor... tüm entry\'ler listeye eklendi uyarısını alana kadar bu sayfayı kapatmayın.')
      loadAllEntries()
    }
  })
}

function loadAllEntries() {
  const btn = document.getElementById('delete-all-entries') as HTMLButtonElement

  if (!btn)
    return

  btn.disabled = true
  btn.innerText = 'entry\'ler yükleniyor... lütfen bekleyin...'

  const loadInterval = setInterval(() => {
    const loadMoreLink = document.getElementsByClassName('load-more-entries')
    const lastPage = document.getElementById('no-more-data')

    if (!lastPage) {
      loadMoreLink[0].click()
    }
    else {
      clearInterval(loadInterval)
      addAllEntriesToList()
    }
  }, 500)
}

function addAllEntriesToList() {
  const btn = document.getElementById('delete-all-entries') as HTMLButtonElement

  if (!btn)
    return

  btn.innerText = 'entry\'ler silme listesine ekleniyor... lütfen bekleyin...'

  const elements = document.getElementsByClassName('add-entry-to-delete-list')
  let i = 0

  const deleteInterval = setInterval(() => {
    elements[i].click()
    i++

    if (i >= elements.length) {
      clearInterval(deleteInterval)

      alert('tüm entry\'ler listeye eklendi. silme işleminin devam etmesi için en az bir eksisozluk.com sayfasının açık olduğuna emin olun.')

      btn.innerText = 'tüm entry\'ler silme listesine eklendi.'
    }
  }, 100)
}
