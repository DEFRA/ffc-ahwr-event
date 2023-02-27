const { odata } = require('@azure/data-tables')
const createTableClient = require('../azure-storage/create-table-client')

const tableName = process.env.AZURE_STORAGE_TABLE

const queryEntities = async (partitionKey, rowKey) => {
  const events = []
  if (partitionKey && rowKey) {
    const tableClient = createTableClient(tableName)
    await tableClient.createTable(tableName)
    const eventResults = tableClient.listEntities(
      {
        queryOptions: {
          filter: odata`PartitionKey eq ${partitionKey} and RowKey eq ${rowKey}`
        }
      }
    )
    for await (const event of eventResults) {
      events.push(event)
    }
  }

  return events
}

module.exports = queryEntities
