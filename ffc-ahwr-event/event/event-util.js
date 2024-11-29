const buildRowKey = (partitionKey, timespan, eventType) => {
  return `${partitionKey}_${timespan}_${eventType}`
}

module.exports = { buildRowKey }
