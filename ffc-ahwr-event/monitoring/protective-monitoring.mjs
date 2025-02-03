import { PublishEvent } from 'ffc-protective-monitoring'

export async function saveMonitoringEvent (event) {
  const protectiveMonitoring = new PublishEvent(process.env.MONITORING_URL)

  await protectiveMonitoring.sendEvent({
    sessionid: event.properties.id.toString(),
    datetime: new Date().toISOString(),
    version: '1.1',
    application: process.env.MONITORING_APPLICATION,
    component: 'Annual health and welfare review of livestock',
    ip: event.properties.ip,
    pmccode: process.env.PMC_CODE,
    priority: '0',
    details: {
      message: event.properties
    }
  })
}
