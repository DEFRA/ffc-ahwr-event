import { queryEntities } from '../azure-storage/query-entities'

export const onApplicationStatusEvent = async (context, event) => {
  const partitionKey = `${event.properties.action.data.reference}`
  let rowKey = `${partitionKey}_${new Date(event.properties.action.raisedOn).getTime()}`
  const eventType = event.properties.action.type
  const checkIfDuplicate = await queryEntities(
    'ffcahwrapplicationstatus',
    partitionKey,
    rowKey,
    eventType
  )
  if (checkIfDuplicate.length > 0) {
    rowKey = `${event.properties.id}_${new Date().getTime()}`
    event.properties.status = 'duplicate event'
  }
  const applicationStatusEvent = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    EventId: event.properties.id,
    EventType: eventType,
    Status: event.properties.status,
    Payload: event.properties.action.data,
    ChangedBy: event.properties.action.raisedBy,
    ChangedOn: event.properties.action.raisedOn
  }
  console.log(`${new Date().toISOString()} 'application-status-event' created: ${JSON.stringify(
    applicationStatusEvent
  )}`)
  context.bindings.applicationstatusBinding = []
  context.bindings.applicationstatusBinding.push(applicationStatusEvent)
  console.log(`${new Date().toISOString()} 'application-status-event' has been saved successfully: ${JSON.stringify({
    partitionKey,
    rowKey
  })}`)
}
