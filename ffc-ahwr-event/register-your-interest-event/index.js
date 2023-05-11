const queryEntities = require('../azure-storage/query-entities')

const onRegisterYourInterestEvent = async (context, event) => {
  const partitionKey = `${event.properties.action.data.businessEmail}`
  let rowKey = `${partitionKey}_${new Date(event.properties.action.raisedOn).getTime()}`
  const checkIfDuplicate = await queryEntities(
    'ffcahwrregisteryourinterest',
    partitionKey,
    rowKey
  )
  if (checkIfDuplicate.length > 0) {
    rowKey = `${event.properties.id}_${new Date().getTime()}`
    event.properties.status = 'duplicate event'
  }
  const registerYourInterestEvent = {
    PartitionKey: partitionKey,
    RowKey: rowKey,
    EventId: event.properties.id,
    EventType: event.properties.action.type,
    Status: event.properties.status,
    Payload: event.properties.action.data,
    ChangedBy: event.properties.action.raisedBy,
    ChangedOn: event.properties.action.raisedOn
  }
  console.log(`${new Date().toISOString()} 'register-your-interest-event' created: ${JSON.stringify(
    registerYourInterestEvent
  )}`)
  context.bindings.registeryourinterestBinding = []
  context.bindings.registeryourinterestBinding.push(registerYourInterestEvent)
  console.log(`${new Date().toISOString()} 'register-your-interest-event' has been saved successfully: ${JSON.stringify({
    partitionKey,
    rowKey
  })}`)
}

module.exports = onRegisterYourInterestEvent
