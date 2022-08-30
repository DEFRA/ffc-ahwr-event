const { saveEvent } = require('./event')
const { validateEvent } = require('./event-schema')

module.exports = async function (context, message) {
  const event = message
  context.log.info(`Received event: ${JSON.stringify(event)}`)

  if (validateEvent(event)) {
    await saveEvent(context, event)
  }
}
