import { saveEvent } from './event/event'
import { validateEvent } from './event/event-schema'
import { saveMonitoring } from './monitoring/monitoring'
import { saveMonitoringEvent } from './monitoring/protective-monitoring'
import { onApplicationStatusEvent } from './application-status-event'
import { onIneligibilityEvent } from './ineligibility-event'

export default async function (context, message) {
  const event = message
  context.log.info(`Received event: ${JSON.stringify(event)}`)

  switch (event.name) {
    case 'send-session-event':
    case 'send-invalid-data-event':
      if (validateEvent(event)) {
        await saveEvent(context, event)
      }
      break
    case 'application-status-event':
      await onApplicationStatusEvent(context, event)
      break
    case 'send-ineligibility-event':
      await onIneligibilityEvent(context, event)
      break
    default:
      await saveMonitoring(context, event)
      if (process.env.MONITORING_ENABLED === 'true') {
        await saveMonitoringEvent(context, event)
      }
  }
}
