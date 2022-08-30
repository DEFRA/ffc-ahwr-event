jest.mock('../ffc-ahwr-event/event')
const mockEvent = require('../ffc-ahwr-event/event')

const processEvent = require('../ffc-ahwr-event/index')
const mockContext = require('./mock-context')

let message

describe('index function', () => {
  beforeEach(async () => {
    message = {
      name: 'test',
      properties: {
        id: '123456789',
        sbi: '123456789',
        cph: '123/456/789',
        checkpoint: 'test',
        status: 'testing',
        action: {
          type: 'test',
          message: 'test',
          data: {},
          raisedBy: 'test',
          raisedOn: new Date()
        }
      }
    }
  })

  afterEach(async () => {
    jest.resetAllMocks()
  })

  test('receives message from service bus and successfully calls save', async () => {
    await processEvent(mockContext, message)
    expect(mockEvent.saveEvent).toHaveBeenCalledTimes(1)
  })

  test('receives message from service bus with invalid id and does not calls save', async () => {
    message.properties.id = 123456789
    await processEvent(mockContext, message)
    expect(mockEvent.saveEvent).toHaveBeenCalledTimes(0)
  })

  test('receives message from service bus with no action property and does not calls save', async () => {
    delete message.properties.action
    await processEvent(mockContext, message)
    expect(mockEvent.saveEvent).toHaveBeenCalledTimes(0)
  })
})
