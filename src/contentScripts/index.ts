/* eslint-disable no-console */
import { onMessage } from 'webext-bridge/content-script'
import { createApp } from 'vue'
import App from './views/App.vue'
import { setupApp } from '~/logic/common-setup'
import { entries } from '~/logic/entries'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script')

  // communication example: send previous tab title from background page
  onMessage('tab-prev', ({ data }) => {
    console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
  })

  //
  injectEk$i()

  window.onload = function () {
    setTimeout(createSubMenuItems, 1000)
  }

  // mount component to context window
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
})()

function injectEk$i() {
  const th = document.getElementsByTagName('body')[0]
  const s = document.createElement('script')
  s.setAttribute('type', 'text/javascript')
  s.setAttribute('src', browser.runtime.getURL('assets/eksiScript.js'))
  th.appendChild(s)
}

function showMsg(msg: string) {
  window.postMessage({ type: 'FROM_CONTENT_SCRIPT', text: msg }, '*')
}

function createSubMenuItems() {
  const uls = document.querySelectorAll('ul.dropdown-menu.right.toggles-menu')

  console.log(uls.length)
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

  // Check if the id already exists in the list
  if (entries.value.includes(id)) {
    showMsg('entry silme sırasında.')

    return // Exit the function if the id already exists
  }

  // If the id doesn't exist, push it to the list
  entries.value.push(id)

  // Success
  showMsg('silme listesine eklendi.')
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
