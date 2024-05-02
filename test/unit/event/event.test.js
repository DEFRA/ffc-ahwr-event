const queryEntities = require('../../../ffc-ahwr-event/azure-storage/query-entities')
const { saveEvent } = require('../../../ffc-ahwr-event/event/event')
const mockContext = require('../../mock/mock-context')

jest.mock('../../../ffc-ahwr-event/azure-storage/query-entities')

describe('Event function', () => {
  const message = {
    name: 'send-session-event',
    properties: {
      id: '123456789',
      sbi: '123456789',
      cph: '123/456/789',
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
    queryEntities.mockResolvedValue([])

    await saveEvent(mockContext, message)
    expect(queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
  })

  test('Duplicated event found NOT created if name is not send-session-event', async () => {
    queryEntities.mockResolvedValue([{ test: 'test' }])
    await saveEvent(mockContext, {...message, name: 'some-other-event'})
    expect(queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
    expect(mockContext.bindings.tableBinding[0].Status).toEqual('in progress')
  })
  
  test('Duplicated event found created', async () => {
    queryEntities.mockResolvedValue([{ test: 'test' }])
    await saveEvent(mockContext, message)
    expect(queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
    expect(mockContext.bindings.tableBinding[0].Status).toEqual('duplicate event')
  })

  test('Save an event with a projection created', async () => {
    queryEntities.mockResolvedValue([])
    await saveEvent(mockContext, message)
    expect(queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
  })
})
