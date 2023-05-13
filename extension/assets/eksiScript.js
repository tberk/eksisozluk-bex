window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source !== window || !event.data.type)
    return

  // Shows eksi ui messages
  if (event.data.type === 'FROM_CONTENT_SCRIPT_UI_MESSAGE')
    // eslint-disable-next-line no-undef
    ek$i.success(event.data.text)

  // Makes delete calls
  if (event.data.type === 'FROM_CONTENT_SCRIPT_DELETE') {
    const id = event.data.id

    // eslint-disable-next-line no-console
    console.log(`Making a delete call to: ${id}`)

    // eslint-disable-next-line no-undef
    $.post('/entry/sil', { id })
      .done(() => {
        window.postMessage({ type: 'ENTRY_DELETE_SUCCESS', id }, '*')
      })
      .fail(() => {
        window.postMessage({ type: 'ENTRY_DELETE_FAIL', id }, '*')
      })
  }
}, false)
