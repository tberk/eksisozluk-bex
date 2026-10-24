// Adds "silme listesine ekle" to the menu of the user's own entries, and a
// button on the user's own profile that queues every entry at once.

const MENU_SELECTOR = 'ul.dropdown-menu.right.toggles-menu'
const ITEM_CLASS = 'eksi-silici-add'

// Only the user's own entries have an edit ("duzelt") link, ending with the entry id
function getEntryId(menu) {
  for (const link of menu.querySelectorAll('a[href*="duzelt"]')) {
    const id = Number.parseInt(new URL(link.href).pathname.split('/').pop(), 10)
    if (id > 0)
      return id
  }
  return null
}

function addEntries(ids) {
  return chrome.runtime.sendMessage({ type: 'add', ids })
}

function decorateMenus() {
  for (const menu of document.querySelectorAll(MENU_SELECTOR)) {
    if (menu.querySelector(`.${ITEM_CLASS}`))
      continue

    const id = getEntryId(menu)
    if (id === null)
      continue

    const link = document.createElement('a')
    link.className = ITEM_CLASS
    link.dataset.id = id
    link.textContent = 'silme listesine ekle'
    link.style.fontWeight = 'bold'
    link.style.cursor = 'pointer'

    const item = document.createElement('li')
    item.append(link)
    menu.append(item)
  }
}

document.addEventListener('click', (event) => {
  const link = event.target.closest?.(`.${ITEM_CLASS}`)
  if (!link)
    return

  event.preventDefault()
  document.body.click() // close the dropdown
  addEntries([Number(link.dataset.id)])
})

function addDeleteAllButton() {
  const sections = document.getElementById('profile-stats-sections')
  // The message button only shows on other people's profiles
  if (!sections || document.getElementById('btnmsg') || document.getElementById('eksi-silici-all'))
    return

  const button = document.createElement('button')
  button.id = 'eksi-silici-all'
  button.className = 'primary'
  button.textContent = 'tüm entry\'leri silme listesine ekle'
  sections.insertBefore(button, document.getElementById('profile-stats-section-content'))

  button.addEventListener('click', async () => {
    if (!confirm('tüm entry\'lerini silmek istediğine emin misin? başka bir deyişle, yolun açık olsun mu paşam?'))
      return

    button.disabled = true
    button.textContent = 'entry\'ler yükleniyor... lütfen bu sayfayı kapatmayın.'

    await loadAllEntries()

    const ids = [...document.querySelectorAll(MENU_SELECTOR)]
      .map(getEntryId)
      .filter(id => id !== null)
    const { added = 0 } = await addEntries(ids) ?? {}

    button.textContent = `${added} entry silme listesine eklendi.`
    alert(`${added} entry silme listesine eklendi. silme işleminin devam etmesi için en az bir ekşi sözlük sekmesinin açık olduğuna emin ol.`)
  })
}

// Keep clicking "load more" until the profile says there is no more data
async function loadAllEntries() {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  let misses = 0

  while (!document.getElementById('no-more-data') && misses < 20) {
    const more = document.querySelector('.load-more-entries')
    if (more) {
      misses = 0
      more.click()
    }
    else {
      misses++ // link is missing while the next page loads
    }
    await sleep(500)
  }
}

// Entries are added to the page dynamically (paging, profile tabs)
let scheduled = false
new MutationObserver(() => {
  if (scheduled)
    return
  scheduled = true
  requestAnimationFrame(() => {
    scheduled = false
    decorateMenus()
    addDeleteAllButton()
  })
}).observe(document.body, { childList: true, subtree: true })

decorateMenus()
addDeleteAllButton()
