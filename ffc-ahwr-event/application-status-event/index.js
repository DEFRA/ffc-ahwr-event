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
    Status: event.properties.status,
    ChangedBy: event.properties.action.raisedBy,
    ChangedOn: event.properties.action.raisedOn,
    ApplicationStatus: event.properties.action.data.applicationStatus,
    Remark: event.properties.action.data.remark
  }
  console.log(`${new Date().toISOString()} 'application-status-event' created: ${JSON.stringify(
    applicationStatusEvent
  )}`)
  context.bindings.tableBinding = []
  context.bindings.tableBinding.push(applicationStatusEvent)
  console.log(`${new Date().toISOString()} 'application-status-event' has been saved successfully: ${JSON.stringify({
    partitionKey,
    rowKey
  })}`)
}

module.exports = onApplicationStatusEvent
