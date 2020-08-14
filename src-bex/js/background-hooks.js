// Hooks added here have a bridge allowing communication between the BEX Background Script and the BEX Content Script.
// Note: Events sent from this background script using `bridge.send` can be `listen`'d for by all client BEX bridges for this BEX

// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/background-hooks

let isListenerAdded = false

export default function attachBackgroundHooks (bridge /* , allActiveConnections */) {
  bridge.on('storage.get', event => {
    const payload = event.data
    if (payload.key === null) {
      chrome.storage.local.get(null, r => {
        const result = []

        // Group the items up into an array to take advantage of the bridge's chunk splitting.
        for (const itemKey in r) {
          result.push(r[itemKey])
        }
        bridge.send(event.eventResponseKey, result)
      })
    } else {
      chrome.storage.local.get([payload.key], r => {
        bridge.send(event.eventResponseKey, r[payload.key])
      })
    }
  })

  bridge.on('storage.set', event => {
    const payload = event.data
    chrome.storage.local.set({ [payload.key]: payload.data }, () => {
      bridge.send(event.eventResponseKey, payload.data)
    })
  })

  bridge.on('storage.remove', event => {
    const payload = event.data
    chrome.storage.local.remove(payload.key, () => {
      bridge.send('update.ui')
      bridge.send(event.eventResponseKey, payload.data)
    })
  })

  /*
  // EXAMPLES
  // Listen to a message from the client
  bridge.on('test', d => {
    console.log(d)
  })

  // Send a message to the client based on something happening.
  chrome.tabs.onCreated.addListener(tab => {
    bridge.send('browserTabCreated', { tab })
  })

  // Send a message to the client based on something happening.
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      bridge.send('browserTabUpdated', { tab, changeInfo })
    }
  })
 */

  // Start
  bridge.on('list.start', event => {
    createAlarm()
    // startInterval()
    bridge.send(event.eventResponseKey)
  });

  // Stop
  bridge.on('list.stop', event => {
    //stopInterval()
    deleteAlarm()
    bridge.send(event.eventResponseKey)
  });

  function createAlarm () {
    console.log('??? Checking alarm status...')
    // chrome.alarms.create('entryAlarm', {periodInMinutes: 0.3})
    chrome.alarms.get('entryAlarm', (alarm) => {
      // Not Found
      if (alarm === undefined) {
        // Create
        chrome.alarms.create('entryAlarm', {periodInMinutes: 1})
        console.log('+++ Alarm created')
      }
      else {
        console.log('!!! Alarm found', alarm)
      }
    })
  }

  function deleteAlarm () {
    chrome.alarms.clear('entryAlarm', (isSuccess) => {
      console.log('alarm cleared')
    })
  }

  if (!isListenerAdded) {
    isListenerAdded = true
    chrome.alarms.onAlarm.addListener(alarmListener);
    console.log('listener added')
  } else {
    console.log('listener already added')
  }

  // chrome.alarms.onAlarm.removeListener(alarmListener);


  function alarmListener (alarm) {
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!alarm triggered', alarm)

    // Check list
    checkList()
  }
/*
  function startInterval () {
    console.log('Starting interval...');

    if (!myInterval)
      myInterval = setInterval(() => {
        checkList()
      }, 10000);
  }
  function stopInterval () {
    if (interval !== null)
      clearInterval(interval)
  }
*/

  bridge.on('lists.updated', event => {
    console.log('Lists updated')
    bridge.send(event.eventResponseKey)

    bridge.send('update.ui')
  })

  bridge.on('entry.deleted', event => {
    const entryId = event.data.id

    console.log('++++++ Entry deleted successfully.')

    // Delete from queue
    removeFromList('list.entries', entryId)

    // Add to deleted list
    addToList('list.deleted', entryId)
  });

  bridge.on('entry.not.deleted', event => {
    console.log('request failed')
    chrome.storage.local.get('list.entries', r => {
      let list = r['list.entries']

      if (list === undefined || list.length <= 1) {
        console.log('no need for switching')
        return
      }

      console.log('switching positions')
      let first = list.shift()
      list.push(first)

      // Save storage
      chrome.storage.local.set({ ['list.entries']: list }, () => {
        console.log('list.entries saved to storage', list)
      })
    })
  });

  function checkList () {
    console.log('checking entry list...')
    chrome.storage.local.get('list.entries', r => {
      let list = r['list.entries']

      if (list === undefined || list.length === 0) {
        console.log('No need for further action. List is empty.')
        return
      }

      //
      let entryId = list[0]

      //
      if (entryId === null) {
        console.log('id null')
        return
      }

      // Delete Entry
      console.log('+++ Sending delete request to content hook', new Date())
      bridge.send('delete.entry', { id: entryId }).then(response => {
        console.log('delete.entry response', response)

        const result = response.data

        console.log('result is: ', result)
      })
    })
  }

  function addToList (listName, id) {
    chrome.storage.local.get(listName, r => {
      let list = r[listName]

      if (list === undefined)
        list = []

      if (id === undefined || id === null) {
        console.log('id is null, not adding')
        return
      }

      // Item exists?
      if (list.indexOf(id) !== -1) {
        console.log('item exists in the list')
        return
      }

      // Add Item
      list.push(id)

      // Save storage
      chrome.storage.local.set({ [listName]: list }, () => {
        console.log(listName + 'saved to storage', list)

        // Lists Updated
        bridge.send('update.ui')
      })
    });
  }

  function removeFromList (listName, id) {
    chrome.storage.local.get(listName, r => {
      let list = r[listName]

      if (list === undefined || list.length === 0) {
        console.log('no need for removing')
        return
      }

      if (id === undefined || id === null) {
        console.log('id is null, not removing')
        return
      }

      const i = list.indexOf(id)

      if (i === -1) {
        console.log('not found on list', id)
        return
      }

      // Remove Item
      list.splice(i, 1);

      // Save storage
      chrome.storage.local.set({ [listName]: list }, () => {
        console.log(listName + 'saved to storage', list)

        // Lists Updated
        bridge.send('update.ui')
      })
    })
  }
}
