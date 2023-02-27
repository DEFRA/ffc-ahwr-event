const { DefaultAzureCredential } = require('@azure/identity')
const { TableClient } = require('@azure/data-tables')

const createTableClient = (tableName) => {
  if (process.env.AZURE_STORAGE_USE_CONNECTION_STRING) {
    console.log(`Creating the table client using the connection string: ${JSON.stringify({
      connectionString: process.env.TableConnectionString,
      tableName
    })}`)
    return TableClient.fromConnectionString(
      process.env.TableConnectionString,
      tableName,
      {
        allowInsecureConnection: true
      }
    )
  } else {
    console.log(`Creating the table client using the DefaultAzureCredential: ${JSON.stringify({
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
      tableName
    })}`)
    return new TableClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.table.core.windows.net`,
      tableName,
      new DefaultAzureCredential()
    )
  }
}

module.exports = createTableClient
