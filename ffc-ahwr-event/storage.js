const { DefaultAzureCredential } = require('@azure/identity')
const { TableClient, odata } = require('@azure/data-tables')

let tableClient
let tableMonitoringClient
let tableInitialised
const tableMonitoringName = 'monitoring'
const tableName = process.env.AZURE_STORAGE_TABLE

if (process.env.AZURE_STORAGE_USE_CONNECTION_STRING) {
  console.log('Using connection string for TableClient')
  tableClient = TableClient.fromConnectionString(process.env.TableConnectionString, tableName, { allowInsecureConnection: true })
  tableMonitoringClient = TableClient.fromConnectionString(process.env.TableConnectionString, tableMonitoringName, { allowInsecureConnection: true })
} else {
  console.log('Using DefaultAzureCredential for BlobServiceClient')

  tableClient = new TableClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.table.core.windows.net`,
    tableName,
    new DefaultAzureCredential()
  )

  tableMonitoringClient = new TableClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.table.core.windows.net`,
    tableMonitoringName,
    new DefaultAzureCredential()
  )
}

const initialiseTable = async () => {
  console.log('Making sure table exist')
  await tableClient.createTable(tableName)
  await tableMonitoringClient.createTable(tableMonitoringName)
  tableInitialised = true
}

const queryEntities = async (partitionKey, rowKey) => {
  const events = []
  if (partitionKey && rowKey) {
    tableInitialised ?? await initialiseTable()
    const eventResults = tableClient.listEntities({ queryOptions: { filter: odata`PartitionKey eq ${partitionKey} and RowKey eq ${rowKey}` } })
    for await (const event of eventResults) {
      events.push(event)
    }
  }

  return events
}

module.exports = { queryEntities }
