const { buildRowKey } = require('../../../ffc-ahwr-event/event/event-util')

describe('Event function', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('should construct the rowKey correctly', () => {
    const partitionKey = '123456789'
    const timespan = 1698670400000
    const eventType = 'event'
    const expectedRowKey = '123456789_1698670400000_event'
    const result = buildRowKey(partitionKey, timespan, eventType)
    expect(result).toBe(expectedRowKey)
  })

  test('should handle empty partitionKey, timespan, and eventType gracefully', () => {
    const partitionKey = ''
    const timespan = ''
    const eventType = ''
    const expectedRowKey = '__'
    const result = buildRowKey(partitionKey, timespan, eventType)
    expect(result).toBe(expectedRowKey)
  })
})
