import { DefaultAzureCredential } from '@azure/identity'
import { TableClient } from '@azure/data-tables'

export const createTableClient = (tableName) => {
  if (process.env.AZURE_STORAGE_USE_CONNECTION_STRING) {
    return TableClient.fromConnectionString(
      process.env.TableConnectionString,
      tableName,
      {
        allowInsecureConnection: true
      }
    )
  } else {
    return new TableClient(
      `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.table.core.windows.net`,
      tableName,
      new DefaultAzureCredential()
    )
  }
}
