describe('storage function', () => {
  let queryEntities

  beforeAll(() => {
    jest.mock('@azure/data-tables', () => {
      return {
        odata: jest.fn(),
        TableClient: jest.fn().mockImplementation(() => {
          return {
            createTable: jest.fn(),
            listEntities: jest.fn().mockImplementation(() => {
              return [
                { PartitionKey: '123', RowKey: '456', event: 'event1' },
                { PartitionKey: '123', RowKey: '789', event: 'event2' },
                { PartitionKey: '123', RowKey: '101112', event: 'event3' }
              ]
            })
          }
        })
      }
    })

    queryEntities = require('../../../ffc-ahwr-event/azure-storage/query-entities')
  })

  afterAll(() => {
    jest.resetModules()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('return 3 events', async () => {
    const tableName = 'table_name'
    const partitionKey = '123'
    const rowKey = '123_456'
    const events = await queryEntities(tableName, partitionKey, rowKey)
    expect(events.length).toEqual(3)
  })

  test('return 0 events as no partition key or row key is supplied', async () => {
    const events = await queryEntities()
    expect(events.length).toEqual(0)
  })
})
