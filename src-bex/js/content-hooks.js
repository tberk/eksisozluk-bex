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
  detectChanges(bridge)

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
}

function detectChanges (bridge) {
  const targetNode = document.getElementById('profile-stats-section-content');
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


