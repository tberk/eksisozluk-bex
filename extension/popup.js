const $ = id => document.getElementById(id)
const send = message => chrome.runtime.sendMessage(message)

function renderIds(container, ids, origin) {
  container.replaceChildren(...ids.map((id) => {
    const link = document.createElement('a')
    link.href = `${origin}/entry/${id}`
    link.target = '_blank'
    link.textContent = `#${id}`
    return link
  }))
}

async function render() {
  const { queue = [], deleted = [], failed = [], paused = false, waitingForTab = false, origin = 'https://eksisozluk.com' }
    = await chrome.storage.local.get(null)

  const minutes = Math.ceil(queue.length * 31 / 60)
  $('status').textContent = queue.length === 0
    ? 'silme listesi boş.'
    : paused
      ? `${queue.length} entry sırada, silme duraklatıldı.`
      : `${queue.length} entry sırada, tahmini ${minutes} dakika.`

  $('no-tab').hidden = !(waitingForTab && queue.length > 0 && !paused)

  $('queue-section').hidden = queue.length === 0
  $('queue-title').textContent = `silme listesi (${queue.length})`
  $('pause').textContent = paused ? 'devam et' : 'duraklat'
  $('pause').onclick = () => send({ type: 'setPaused', paused: !paused })
  renderIds($('queue'), queue, origin)

  $('failed-section').hidden = failed.length === 0
  $('failed-title').textContent = `silinemeyenler (${failed.length})`
  renderIds($('failed'), failed, origin)

  $('deleted-section').hidden = deleted.length === 0
  $('deleted-title').textContent = `şimdiye kadar ${deleted.length} entry silindi`
  renderIds($('deleted'), deleted, origin)
}

// confirm() is unreliable in popups, so ask with a second click instead
$('clear').addEventListener('click', (event) => {
  const button = event.currentTarget
  if (button.dataset.confirm) {
    send({ type: 'clear' })
    return
  }
  button.dataset.confirm = '1'
  button.textContent = 'emin misin?'
  setTimeout(() => {
    delete button.dataset.confirm
    button.textContent = 'listeyi temizle'
  }, 3000)
})
$('retry').addEventListener('click', () => send({ type: 'retryFailed' }))

chrome.storage.onChanged.addListener(render)
render()
