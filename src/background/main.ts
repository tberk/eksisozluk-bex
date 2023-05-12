import { onMessage, sendMessage } from 'webext-bridge/background'
import { getList, saveList } from '~/logic/entries'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

setInterval(async () => {
  const list = await getList()
  // eslint-disable-next-line no-console
  console.log(list)
}, 5000)

onMessage('add-entry', async ({ data, sender }) => {
  if (!data)
    return

  const id = data.id as number
  const list = await getList()

  // Check
  if (list.includes(id)) {
    showUIMessage('entry silme sırasında.', sender.tabId)

    return
  }

  // Add & save
  list.push(id)
  saveList(list)

  showUIMessage('silme listesine eklendi.', sender.tabId)
})

function showUIMessage(msg: string, id: number) {
  sendMessage('bg-ui-msg', { message: msg }, { context: 'content-script', tabId: id })
}

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
/*
const previousTabId = 0

browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})
*/
