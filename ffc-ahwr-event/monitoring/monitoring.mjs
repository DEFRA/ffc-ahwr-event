import { createTableClient } from '../azure-storage/create-table-client.mjs'

export const saveMonitoring = async (context, event) => {
  const TABLE_NAME = 'monitoring'
  const raisedEvent = event.properties
  const eventType = raisedEvent.action.type
  const eventRaised = new Date(raisedEvent.action.raisedOn)
  const eventRaisedBy = raisedEvent.action.raisedBy ?? 'unknown'
  const timespan = new Date(raisedEvent.action.raisedOn).getTime()

  const partitionKey = 'monitoring'
  const rowKey = `monitoring_${timespan}`
  const sessionId = raisedEvent.id.toString()

  const eventMonitoringLog = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    SessionId: sessionId,
    EventType: eventType,
    EventRaised: eventRaised,
    EventBy: eventRaisedBy,
    Payload: JSON.stringify(raisedEvent.action),
    Status: event.properties.status
  }

  await createTableClient(TABLE_NAME).createTable()

  context.bindings.tableMonitoringBinding = []
  context.bindings.tableMonitoringBinding.push(eventMonitoringLog)
}
