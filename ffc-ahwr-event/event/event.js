const queryEntities = require('../azure-storage/query-entities')

const tableName = process.env.AZURE_STORAGE_TABLE

const saveEvent = async (context, event) => {
  const raisedEvent = event.properties
  const eventType = raisedEvent.action.type
  const sbi = raisedEvent.sbi
  const eventRaised = new Date(raisedEvent.action.raisedOn)
  const eventRaisedBy = raisedEvent.action.raisedBy
  const timespan = new Date(raisedEvent.action.raisedOn).getTime()

  const partitionKey = `${sbi}`
  let rowKey = `${partitionKey}_${timespan}`
  const sessionId = raisedEvent.id.toString()

  const checkIfEntityExists = await queryEntities(tableName, partitionKey, rowKey, eventType)

  if (checkIfEntityExists.length > 0 && event.name === 'send-session-event') {
    rowKey = `${raisedEvent.id}_${new Date().getTime()}`
    event.properties.status = 'duplicate event'
  }

  const eventLog = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    SessionId: sessionId,
    EventType: eventType,
    EventRaised: eventRaised,
    EventBy: eventRaisedBy,
    Payload: JSON.stringify(raisedEvent.action),
    Status: event.properties.status
  }

  context.bindings.tableBinding = []
  context.bindings.tableBinding.push(eventLog)

  context.log.info(`Event saved successfully: partitionKey: ${partitionKey}, rowKey: ${rowKey}`)
}

module.exports = { saveEvent }
