const { queryEntities } = require('./storage')

const saveEvent = async (context, event) => {
  const raisedEvent = event.properties
  const eventType = raisedEvent.action.type
  const sbi = raisedEvent.sbi
  const cph = raisedEvent.cph.replace(/\//g, '')
  const eventRaised = new Date(raisedEvent.action.raisedOn)
  const eventRaisedBy = raisedEvent.action.raisedBy
  const timespan = new Date(raisedEvent.action.raisedOn).getTime()

  const partitionKey = `${sbi}_${cph}`
  let rowKey = `${partitionKey}_${timespan}`
  const sessionId = raisedEvent.id.toString()

  const checkIfEntityExists = await queryEntities(partitionKey, rowKey)

  if (checkIfEntityExists.length > 0) {
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
