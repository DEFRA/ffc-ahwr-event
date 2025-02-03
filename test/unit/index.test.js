import { saveEvent } from '../../ffc-ahwr-event/event/event.mjs'
import { saveMonitoring } from '../../ffc-ahwr-event/monitoring/monitoring.mjs'
import { saveMonitoringEvent } from '../../ffc-ahwr-event/monitoring/protective-monitoring.mjs'
import { onApplicationStatusEvent } from '../../ffc-ahwr-event/application-status-event/index.mjs'
import { onIneligibilityEvent } from '../../ffc-ahwr-event/ineligibility-event/index.mjs'
import processEvent from '../../ffc-ahwr-event/index.mjs'
import mockContext from '../mock/mock-context'

jest.mock('../../ffc-ahwr-event/event/event')
jest.mock('../../ffc-ahwr-event/monitoring/monitoring')
jest.mock('../../ffc-ahwr-event/monitoring/protective-monitoring')
jest.mock('../../ffc-ahwr-event/application-status-event')
jest.mock('../../ffc-ahwr-event/ineligibility-event')

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
      expect(saveEvent).toHaveBeenCalledTimes(1)
      expect(saveMonitoringEvent).toHaveBeenCalledTimes(0)
    })

    test('receives message from service bus and successfully calls save event', async () => {
      await processEvent(mockContext, message)
      expect(saveEvent).toHaveBeenCalledTimes(1)
      expect(saveMonitoringEvent).toHaveBeenCalledTimes(0)
    })

    test('receives message from service bus with invalid id and does not calls save event', async () => {
      message.properties.id = 123456789
      await expect(() => processEvent(mockContext, message))
        .rejects.toThrow('"properties.id" must be a string')
      expect(saveEvent).toHaveBeenCalledTimes(0)
    })

    test('receives message from service bus with no action property and does not calls save event', async () => {
      delete message.properties.action
      await expect(() => processEvent(mockContext, message))
        .rejects.toThrow('"properties.action" is required')
      expect(saveEvent).toHaveBeenCalledTimes(0)
    })
  })

  describe('send-monitoring-event', () => {
    test('receives message from service bus and successfully calls save monitoring event', async () => {
      message.name = 'send-monitoring-event'
      process.env.MONITORING_ENABLED = 'true'
      await processEvent(mockContext, message)
      expect(saveMonitoring).toHaveBeenCalledTimes(1)
      expect(saveMonitoringEvent).toHaveBeenCalledTimes(1)
    })
  })

  describe('application-status-event', () => {
    test('receives message from service bus', async () => {
      message.name = 'application-status-event'

      await processEvent(mockContext, message)

      expect(onApplicationStatusEvent).toHaveBeenCalledTimes(1)
      expect(onApplicationStatusEvent).toHaveBeenCalledWith(mockContext, message)
      expect(saveMonitoring).toHaveBeenCalledTimes(0)
      expect(saveMonitoringEvent).toHaveBeenCalledTimes(0)
    })
  })
})

describe('send-exception-event', () => {
  test('receives message from service bus', async () => {
    message.name = 'send-ineligibility-event'

    await processEvent(mockContext, message)

    expect(onIneligibilityEvent).toHaveBeenCalledTimes(1)
    expect(onIneligibilityEvent).toHaveBeenCalledWith(mockContext, message)
    expect(saveMonitoring).toHaveBeenCalledTimes(0)
    expect(saveMonitoringEvent).toHaveBeenCalledTimes(0)
  })
})
