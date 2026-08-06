import { createTableClient } from '../../../ffc-ahwr-event/azure-storage/create-table-client.mjs'
import { TableClient } from '@azure/data-tables'
import { DefaultAzureCredential } from '@azure/identity'

jest.mock('@azure/data-tables', () => {
  const TableClient = jest.fn()
  TableClient.fromConnectionString = jest.fn()
  return { TableClient }
})

jest.mock('@azure/identity', () => {
  return {
    DefaultAzureCredential: jest.fn()
  }
})

describe('createTableClient', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('builds a client from the connection string when configured to use one', () => {
    process.env.AZURE_STORAGE_USE_CONNECTION_STRING = 'true'
    process.env.TableConnectionString = 'UseDevelopmentStorage=true'

    createTableClient('mytable')

    expect(TableClient.fromConnectionString).toHaveBeenCalledWith(
      'UseDevelopmentStorage=true',
      'mytable',
      { allowInsecureConnection: true }
    )
    expect(TableClient).not.toHaveBeenCalled()
  })

  test('builds a client with managed identity when no connection string is configured', () => {
    delete process.env.AZURE_STORAGE_USE_CONNECTION_STRING
    process.env.AZURE_STORAGE_ACCOUNT_NAME = 'myaccount'

    createTableClient('mytable')

    expect(DefaultAzureCredential).toHaveBeenCalledTimes(1)
    expect(TableClient).toHaveBeenCalledWith(
      'https://myaccount.table.core.windows.net',
      'mytable',
      expect.any(DefaultAzureCredential)
    )
    expect(TableClient.fromConnectionString).not.toHaveBeenCalled()
  })
})
