window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source !== window)
    return

  // Shows eksi ui messages
  if (event.data.type && (event.data.type === 'FROM_CONTENT_SCRIPT'))
    // eslint-disable-next-line no-undef
    ek$i.success(event.data.text)

  // Makes delete calls
  if (event.data.type && (event.data.type === 'FROM_CONTENT_SCRIPT_DELETE')) {
    // Log
    // eslint-disable-next-line no-console
    console.log(`Making a delete call to: ${event.data.id}`)

    // Delete
    // eslint-disable-next-line no-undef
    $.post('/entry/sil', { id: event.data.id })
      .done(() => {
        window.postMessage({ type: 'ENTRY_DELETE_SUCCESS', id: event.data.id }, '*')
      })
      .fail(() => {
        window.postMessage({ type: 'ENTRY_DELETE_FAIL', id: event.data.id }, '*')
      })
  }
}, false)
