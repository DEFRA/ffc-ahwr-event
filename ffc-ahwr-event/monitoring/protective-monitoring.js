import { PublishEvent } from 'ffc-protective-monitoring'

export async function saveMonitoringEvent (context, event) {
  const raisedEvent = event.properties
  const { sbi, ip } = raisedEvent
  const cph = raisedEvent.cph.replace(/\//g, '')
  const protectiveMonitoring = new PublishEvent(process.env.MONITORING_URL)

  await protectiveMonitoring.sendEvent({
    sessionid: raisedEvent.id.toString(),
    datetime: new Date().toISOString(),
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
