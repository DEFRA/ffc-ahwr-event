import { queryEntities } from '../../../ffc-ahwr-event/azure-storage/query-entities.mjs'
import { saveEvent } from '../../../ffc-ahwr-event/event/event.mjs'
import baseMockContext from '../../mock/mock-context'

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

  let mockContext

  beforeEach(() => {
    jest.resetModules()
    mockContext = { ...baseMockContext, bindings: {} }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('Duplicated event found NOT created if name is not send-session-event', async () => {
    queryEntities.mockResolvedValue([{ test: 'test' }])
    await saveEvent(mockContext, { ...message, name: 'some-other-event' })
    expect(queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings.tableBinding).toEqual([{
      EventBy: 'test',
      EventRaised: expect.any(Date),
      EventType: 'event',
      PartitionKey: '123456789',
      Payload: expect.any(String),
      RowKey: expect.any(String),
      SessionId: '123456789',
      Status: 'in progress'
    }])
  })

  test('Duplicated event found created', async () => {
    queryEntities.mockResolvedValue([{ test: 'test' }])
    await saveEvent(mockContext, message)
    expect(queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings.tableBinding).toEqual([
      {
        EventBy: 'test',
        EventRaised: expect.any(Date),
        EventType: 'event',
        PartitionKey: '123456789',
        Payload: expect.any(String),
        RowKey: expect.any(String),
        SessionId: '123456789',
        Status: 'duplicate event'
      }
    ])
    expect(mockContext.bindings.tableBinding[0].Status).toEqual('duplicate event')
  })

  test('Save an event with a projection created', async () => {
    queryEntities.mockResolvedValue([])
    await saveEvent(mockContext, message)
    expect(queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings).toHaveProperty('tableBinding')
  })

  test('rowKey is constructed correctly', async () => {
    queryEntities.mockResolvedValue([])
    await saveEvent(mockContext, message)
    const raisedOn = new Date(message.properties.action.raisedOn).getTime()
    const expectedRowKey = `${message.properties.sbi}_${raisedOn}_${message.properties.action.type}`
    expect(queryEntities).toHaveBeenCalledTimes(1)
    expect(mockContext.bindings.tableBinding[0].RowKey).toBe(expectedRowKey)
  })
})
