const queryEntities = require('../azure-storage/query-entities')

const onApplicationStatusEvent = async (context, event) => {
  const partitionKey = `${event.properties.sbi}`
  let rowKey = `${partitionKey}_${new Date(event.properties.action.raisedOn).getTime()}`
  const checkIfDuplicate = await queryEntities(
    'ffcahwrapplicationstatus',
    partitionKey,
    rowKey
  )
  if (checkIfDuplicate.length > 0) {
    rowKey = `${event.properties.id}_${new Date().getTime()}`
    event.properties.status = 'duplicate event'
  }
  const applicationStatusEvent = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    EventId: event.properties.id,
    EventType: event.properties.action.type,
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

module.exports = onApplicationStatusEvent
