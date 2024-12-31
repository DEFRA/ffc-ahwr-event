import { odata } from '@azure/data-tables'
import { createTableClient } from './create-table-client.mjs'

export const queryEntities = async (tableName, partitionKey, rowKey, eventType) => {
  const events = []
  if (tableName && partitionKey && rowKey && eventType) {
    const tableClient = createTableClient(tableName)
    await tableClient.createTable(tableName)
    const eventResults = tableClient.listEntities(
      {
        queryOptions: {
          filter: odata`PartitionKey eq ${partitionKey} and RowKey eq ${rowKey} and EventType eq ${eventType}`
        }
      }
    )
    for await (const event of eventResults) {
      events.push(event)
    }
  }

  return events
}
