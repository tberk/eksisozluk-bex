window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source !== window)
    return

  if (event.data.type && (event.data.type === 'FROM_CONTENT_SCRIPT'))
    // eslint-disable-next-line no-undef
    ek$i.success(event.data.text)
}, false)
