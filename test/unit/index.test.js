jest.mock('../../ffc-ahwr-event/event/event')
const mockEvent = require('../../ffc-ahwr-event/event/event')

jest.mock('../../ffc-ahwr-event/monitoring/monitoring')
const mockMonitoringEvent = require('../../ffc-ahwr-event/monitoring/monitoring')

jest.mock('../../ffc-ahwr-event/monitoring/protective-monitoring')
const mockProtectiveMonitoringEvent = require('../../ffc-ahwr-event/monitoring/protective-monitoring')

jest.mock('../../ffc-ahwr-event/application-status-event')
const onApplicationStatusEvent = require('../../ffc-ahwr-event/application-status-event')

jest.mock('../../ffc-ahwr-event/ineligibility-event')
const onIneligibilityEvent = require('../../ffc-ahwr-event/ineligibility-event')

const processEvent = require('../../ffc-ahwr-event/index')
const mockContext = require('../mock/mock-context')

let message

describe('index function', () => {
  beforeEach(async () => {
    message = {
      name: 'send-session-event',
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

  describe('send-session-event', () => {
    test('receives message from service bus and successfully calls save event, does not call monitoring event', async () => {
      await processEvent(mockContext, message)
      expect(mockEvent.saveEvent).toHaveBeenCalledTimes(1)
      expect(mockProtectiveMonitoringEvent.saveMonitoringEvent).toHaveBeenCalledTimes(0)
    })

    test('receives message from service bus and successfully calls save event', async () => {
      await processEvent(mockContext, message)
      expect(mockEvent.saveEvent).toHaveBeenCalledTimes(1)
      expect(mockProtectiveMonitoringEvent.saveMonitoringEvent).toHaveBeenCalledTimes(0)
    })

    test('receives message from service bus with invalid id and does not calls save event', async () => {
      message.properties.id = 123456789
      await processEvent(mockContext, message)
      expect(mockEvent.saveEvent).toHaveBeenCalledTimes(0)
    })

    test('receives message from service bus with no action property and does not calls save event', async () => {
      delete message.properties.action
      await processEvent(mockContext, message)
      expect(mockEvent.saveEvent).toHaveBeenCalledTimes(0)
    })
  })

  describe('send-monitoring-event', () => {
    test('receives message from service bus and successfully calls save monitoring event', async () => {
      message.name = 'send-monitoring-event'
      process.env.MONITORING_ENABLED = true
      await processEvent(mockContext, message)
      expect(mockMonitoringEvent.saveMonitoring).toHaveBeenCalledTimes(1)
      expect(mockProtectiveMonitoringEvent.saveMonitoringEvent).toHaveBeenCalledTimes(1)
    })
  })

  describe('application-status-event', () => {
    test('receives message from service bus', async () => {
      message.name = 'application-status-event'

      await processEvent(mockContext, message)

      expect(onApplicationStatusEvent).toHaveBeenCalledTimes(1)
      expect(onApplicationStatusEvent).toHaveBeenCalledWith(mockContext, message)
      expect(mockMonitoringEvent.saveMonitoring).toHaveBeenCalledTimes(0)
      expect(mockProtectiveMonitoringEvent.saveMonitoringEvent).toHaveBeenCalledTimes(0)
    })
  })
})

describe('send-exception-event', () => {
  test('receives message from service bus', async () => {
    message.name = 'send-ineligibility-event'

    await processEvent(mockContext, message)

    expect(onIneligibilityEvent).toHaveBeenCalledTimes(1)
    expect(onIneligibilityEvent).toHaveBeenCalledWith(mockContext, message)
    expect(mockMonitoringEvent.saveMonitoring).toHaveBeenCalledTimes(0)
    expect(mockProtectiveMonitoringEvent.saveMonitoringEvent).toHaveBeenCalledTimes(0)
  })
})
