const { saveEvent } = require('./event')
const { saveMonitoring } = require('./monitoring')
const { validateEvent } = require('./event-schema')
const { sendEvent } = require('./protective-monitoring')

module.exports = async function (context, message) {
  const event = message
  context.log.info(`Received event: ${JSON.stringify(event)}`)

  if (event.name === 'send-session-event') {
    if (validateEvent(event)) {
      await saveEvent(context, event)
      await sendEvent(context, event)
    }
  } else {
    await saveMonitoring(context, event)
  }
}
