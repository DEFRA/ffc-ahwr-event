jest.mock('../ffc-ahwr-event/storage')
const mockStorage = require('../ffc-ahwr-event/storage')
const { saveEvent } = require('../ffc-ahwr-event/event')
const mockContext = require('./mock-context')

describe('Event function', () => {
  const message = {
    properties: {
      id: '123456789',
      status: 'in progress',
      action: {
        type: 'event',
        raisedBy: 'test',
        raisedOn: new Date()
      }
    }
  }

  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('Save an event with no projection created', async () => {
    mockStorage.queryEntities.mockResolvedValue([])

    await saveEvent(mockContext, message)
    expect(mockStorage.queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
  })

  test('Duplicated event found created', async () => {
    mockStorage.queryEntities.mockResolvedValue([{ test: 'test' }])
    await saveEvent(mockContext, message)
    expect(mockStorage.queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
    expect(mockContext.bindings.tableBinding[0].Status).toEqual('duplicate event')
  })

  test('Save an event with a projection created', async () => {
    mockStorage.queryEntities.mockResolvedValue([])
    await saveEvent(mockContext, message)
    expect(mockStorage.queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
  })
})
