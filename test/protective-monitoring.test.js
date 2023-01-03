const { sendEvent } = require('../ffc-ahwr-event/protective-monitoring')
const mockContext = require('./mock-context')

const mockSendEvent = jest.fn()
jest.mock('ffc-protective-monitoring', () => {
  return {
    PublishEvent: jest.fn().mockImplementation(() => {
      return { sendEvent: mockSendEvent }
    })
  }
})

describe('Event function', () => {
  const message = {
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

  test('Send event', async () => {
    await sendEvent(mockContext, message)
    expect(mockSendEvent).toHaveBeenCalledTimes(1)
  })
})
