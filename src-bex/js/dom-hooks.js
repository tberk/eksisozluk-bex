// Hooks added here have a bridge allowing communication between the Web Page and the BEX Content Script.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/dom-hooks

export default function attachDomHooks (bridge) {
  // Hide modals
  bridge.on('hide.modal', event => {
    console.log('hide modal triggered')
    window.jQuery("body").trigger("click")
    bridge.send(event.eventResponseKey)
  })

  // Success pop
  bridge.on('show.success', event => {
    ek$i.success(event.data.message)
    bridge.send(event.eventResponseKey)
  })
}




