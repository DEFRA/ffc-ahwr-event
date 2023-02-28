const queryEntities = require('../azure-storage/query-entities')

const onApplicationStatusEvent = async (context, event) => {
  console.log(`${new Date().toISOString()} On application status event: ${JSON.stringify({ event })}`)

  const partitionKey = `${event.properties.sbi}`
  let rowKey = `${partitionKey}_${new Date(event.properties.action.raisedOn).getTime()}`

  const checkIfEntityExists = await queryEntities(
    'ffcahwrapplicationstatus',
    partitionKey,
    rowKey
  )

  if (checkIfEntityExists.length > 0) {
    rowKey = `${event.properties.id}_${new Date().getTime()}`
    event.properties.status = 'duplicate event'
  }

  context.bindings.tableBinding = []
  context.bindings.tableBinding.push({
    PartitionKey: partitionKey,
    RowKey: rowKey,
    Status: event.properties.status,
    ChangedBy: event.properties.action.raisedBy,
    ChangedOn: event.properties.action.raisedOn,
    ApplicationStatus: event.properties.action.data.applicationStatus,
    Remark: event.properties.action.data.remark
  })

  console.log(`${new Date().toISOString()} 'application-status-event' has been saved successfully: ${JSON.stringify({
    partitionKey,
    rowKey
  })}`)
}

module.exports = onApplicationStatusEvent
