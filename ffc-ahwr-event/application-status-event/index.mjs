import { queryEntities } from '../azure-storage/query-entities.mjs'

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

  context.bindings.applicationstatusBinding = []
  context.bindings.applicationstatusBinding.push(applicationStatusEvent)
}
