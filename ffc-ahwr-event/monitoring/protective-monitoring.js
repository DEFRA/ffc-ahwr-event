const { PublishEvent } = require('ffc-protective-monitoring')

async function saveMonitoringEvent (context, event) {
  const raisedEvent = event.properties
  const { sbi, ip } = raisedEvent
  const cph = raisedEvent.cph.replace(/\//g, '')
  const protectiveMonitoring = new PublishEvent(process.env.MONITORING_URL)

  await protectiveMonitoring.sendEvent({
    sessionid: raisedEvent.id.toString(),
    datetime: createEventDate(),
    version: '1.1',
    application: process.env.MONITORING_APPLICATION,
    component: 'Annual health and welfare review of livestock',
    ip,
    pmccode: process.env.PMC_CODE,
    priority: '0',
    details: {
      message: raisedEvent
    }
  })

  context.log.info(`Protective monitoring event sent successfully for SBI ${sbi}, CPH ${cph}`)
}

function createEventDate () {
  const eventDate = new Date()
  return eventDate.toISOString()
}

module.exports = { saveMonitoringEvent }
