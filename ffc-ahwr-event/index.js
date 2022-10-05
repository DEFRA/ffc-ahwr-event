const { saveEvent } = require('./event')
const { saveMonitoring } = require('./monitoring')
const { validateEvent } = require('./event-schema')

module.exports = async function (context, message) {
  const event = message
  context.log.info(`Received event: ${JSON.stringify(event)}`)

  if (event.name === 'send-session-event') {
    if (validateEvent(event)) {
      await saveEvent(context, event)
    }
  } else {
    await saveMonitoring(context, event)
  }
}
