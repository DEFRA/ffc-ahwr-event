const { saveEvent } = require('./event/event')
const { validateEvent } = require('./event/event-schema')
const { saveMonitoring } = require('./monitoring/monitoring')
const { saveMonitoringEvent } = require('./monitoring/protective-monitoring')

module.exports = async function (context, message) {
  const event = message
  context.log.info(`Received event: ${JSON.stringify(event)}`)

  if (event.name === 'send-session-event') {
    if (validateEvent(event)) {
      await saveEvent(context, event)
    }
  } else {
    await saveMonitoring(context, event)
    if (process.env.MONITORING_ENABLED) {
      await saveMonitoringEvent(context, event)
    }
  }
}
