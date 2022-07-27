const { queryEntities } = require('./storage')

const saveEvent = async (context, event) => {
  const eventType = event.name
  const raisedEvent = event.properties
  const eventRaised = new Date(raisedEvent.action.raisedOn)
  const timespan = new Date(raisedEvent.action.raisedOn).getTime()

  const partitionKey = raisedEvent.id.toString()
  let rowKey = `${raisedEvent.id}_${timespan}`

  const checkIfEntityExists = await queryEntities(partitionKey, rowKey)

  if (checkIfEntityExists.length > 0) {
    rowKey = `${raisedEvent.id}_${new Date().getTime()}`
    event.properties.status = 'duplicate event'
  }

  const eventLog = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    EventType: eventType,
    EventRaised: eventRaised,
    Payload: JSON.stringify(raisedEvent.action),
    Status: event.properties.status
  }

  context.bindings.tableBinding = []
  context.bindings.tableBinding.push(eventLog)

  context.log.info(`Event saved successfully: partitionKey: ${partitionKey}, rowKey: ${rowKey}`)
}

module.exports = { saveEvent }
