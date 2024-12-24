import { queryEntities } from '../azure-storage/query-entities.mjs'

export const onIneligibilityEvent = async (context, event) => {
  const partitionKey = `${event.properties.action.data.sbi}`
  let rowKey = `${partitionKey}_${new Date(event.properties.action.raisedOn).getTime()}`
  const eventType = event.properties.action.type
  const checkIfDuplicate = await queryEntities(
    'ffcahwrineligibility',
    partitionKey,
    rowKey,
    eventType
  )
  if (checkIfDuplicate.length > 0) {
    rowKey = `${event.properties.id}_${new Date().getTime()}`
    event.properties.status = 'duplicate event'
  }
  const ineligibilityEvent = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    EventId: event.properties.id,
    EventType: eventType,
    Status: event.properties.status,
    Payload: event.properties.action.data,
    ChangedBy: event.properties.action.raisedBy,
    ChangedOn: event.properties.action.raisedOn
  }
  console.log(`${new Date().toISOString()} 'ineligibility-event' created: ${JSON.stringify(
    ineligibilityEvent
  )}`)
  context.bindings.ineligibilityBinding = []
  context.bindings.ineligibilityBinding.push(ineligibilityEvent)
  console.log(`${new Date().toISOString()} 'ineligibility-event' has been saved successfully: ${JSON.stringify({
    partitionKey,
    rowKey
  })}`)
}
