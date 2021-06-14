// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks

import jQuery from "./jquery-3.5.1.min";
window.$ = window.jQuery = jQuery;

export default function attachContentHooks ( bridge ) {
  // Trigger
  bridge.send('list.start').then(response => {
     console.log('list started', response)
  });

  //
  createMenuItems(bridge)

  //
  createDeleteAllButton(bridge)

  // Listen delete requests
  bridge.on('delete.entry', event => {
    const entryId = event.data.id
    console.log('++++ Received delete request for id: ', entryId)

    deleteEntry(bridge, entryId).then((result) => {
      console.log('deleteEntry result here: ', result)
      console.log('should send event response back now')

      if (result)
        bridge.send('entry.deleted', { id: entryId })
      else
        bridge.send('entry.not.deleted')

      bridge.send(event.eventResponseKey, result)
    });
  })

  //
  detectChanges(bridge)
}

function detectChanges (bridge) {
  const targetNode = document.getElementById('profile-stats-section-content');

  if (targetNode) {
    const config = { attributes: false, childList: true, subtree: false };

    const callback = function(mutationsList, observer) {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          createMenuItems(bridge)
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
  }
}

function createMenuItems (bridge) {
  const uls = document.getElementsByClassName("dropdown-menu right toggles-menu");

  for (let i=0, max = uls.length; i < max; i++) {
    // Get ID
    const ul = uls[i]
    const id = getEntryIdFromUL(ul)

    // No id?
    if (id === null)
      continue

    // Added before
    if (ul.innerText.search('silme listesine ekle') !== -1)
      continue

    // Create menu item
    let a = document.createElement("a")
    a.classList.add('add-entry-to-delete-list')
    a.innerText = 'silme listesine ekle'
    let li = document.createElement("li")
    li.appendChild(a)
    uls[i].appendChild(li)

    // Add to list on click
    li.addEventListener("click", () => {
      addEntryToList(bridge, id)
    });
  }
}

function addEntryToList (bridge, id) {
  bridge.send('storage.get', { key: 'list.entries' }).then(response => {
    let list = response.data

    if (list === undefined)
      list = []

    // Item exists?
    if (list.indexOf(id) !== -1) {
      console.log('item exists in the list')
      bridge.send('show.success', { message: 'entry silme sırasında' })
      bridge.send('hide.modal')
      return
    }

    // Add Item
    list.push(id)

    // Save List
    bridge.send('storage.set', { key: 'list.entries', data: list }).then(response => {
      console.log('List saved successfully. Response: ', response.data)

      // Hide sub menu
      bridge.send('hide.modal')

      //
      bridge.send('show.success', { message: 'silme listesine eklendi.' })

      // Lists Updated
      bridge.send('lists.updated')
    });
  })
}

function getEntryIdFromUL (ul) {
  const links = ul.getElementsByTagName("a")

  for (let i=0, max = links.length; i < max; i++) {
    const link = links[i]

    if (link.href.includes('duzelt')) {
      const parts = link.href.split("/");

      if (parts.length > 1) {
        const id = parts[parts.length - 1];
        console.log('Found ID: ', id)
        return id
      }
    }
  }

  return null
}

function deleteEntry (bridge, id) {
  return new Promise((resolve) => {
    console.log('Making a delete call...')
    $.post('/entry/sil', { id: id })
      .done(function() {
        bridge.send('show.success', { message: '#' + id + ' silindi.' })
        console.log('success')
        resolve(true)
      })
      .fail(function() {
        console.log('failed')
        resolve(false)
      })
  })
}


/**
 * 1.2 Delete All
 */
function createDeleteAllButton (bridge) {
  console.log('creating delete all button');
  // Own profile?

  // const check = document.getElementsByClassName('add-entry-to-delete-list')
  // v1.2.1 fix
  const check = document.getElementById('btnmsg')

  if (check) {
    console.log('**** cant create ***')
    return
  }


  // Create button
  const button = document.createElement("button")
  button.classList.add('primary')
  button.innerText = "tüm entry'leri silme listesine ekle"
  button.id = 'delete-all-entries'

  // Append button
  const profileSection = document.getElementById('profile-stats-section-content')
  // profileSection.prepend(button)

  // v1.2.1 fix
  document.getElementById('profile-stats-sections').insertBefore(button, profileSection)

  console.log('delete all created', profileSection, button)

  // On click button
  button.addEventListener("click", () => {
    const r = confirm("tüm entry'lerini silmek istediğine emin misin? başka bir deyişle, yolun açık olsun mu paşam?");
    if (r === true) {
      alert("işlem başlıyor... tüm entry'ler listeye eklendi uyarısını alana kadar bu sayfayı kapatmayın.")
      loadAllEntries()
    }
  });
}

function loadAllEntries() {
  document.getElementById('delete-all-entries').disabled = true
  document.getElementById('delete-all-entries').innerText = "entry'ler yükleniyor... lütfen bekleyin..."

  const loadInterval = setInterval(() => {
    const loadMoreLink = document.getElementsByClassName('load-more-entries')
    const lastPage = document.getElementById('no-more-data')

    if (!lastPage)
      loadMoreLink[0].click()
    else {
      clearInterval(loadInterval)
      addAllEntriesToList()
    }
  }, 500);
}

function addAllEntriesToList () {
  document.getElementById('delete-all-entries').innerText = "entry'ler silme listesine ekleniyor... lütfen bekleyin..."

  const elements = document.getElementsByClassName("add-entry-to-delete-list");
  let i = 0

  const deleteInterval = setInterval(() => {
    elements[i].click()
    i++

    if (i >= elements.length) {
      clearInterval(deleteInterval)
      alert("tüm entry'ler listeye eklendi. silme işleminin devam etmesi için en az bir eksisozluk.com sayfasının açık olduğuna emin olun.")

      document.getElementById('delete-all-entries').innerText = "tüm entry'ler silme listesine eklendi."
    }
  }, 200)
}
