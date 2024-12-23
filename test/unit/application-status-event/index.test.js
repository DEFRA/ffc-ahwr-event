import { onApplicationStatusEvent } from '../../../ffc-ahwr-event/application-status-event'

const mockListEntities = jest.fn()

jest.mock('@azure/data-tables', () => {
  return {
    odata: jest.fn(),
    TableClient: jest.fn().mockImplementation(() => {
      return {
        createTable: jest.fn(),
        listEntities: jest.fn().mockImplementation(() => {
          return mockListEntities
        })
      }
    })
  }
})

const MOCK_NOW = new Date()

describe('onApplicationStatusEvent', () => {
  let logSpy

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    logSpy = jest.spyOn(console, 'log')
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.mock('@azure/identity', () => {
      return {
        DefaultAzureCredential: jest.fn().mockImplementation(() => {})
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  test.each([
    {
      toString: () => 'success',
      given: {
        context: {
          bindings: {}
        },
        event: {
          name: 'application-status-event',
          properties: {
            id: 'eventID',
            sbi: '123456789',
            status: 'success',
            action: {
              type: 'event-type',
              data: {
                reference: 'ref',
                statusId: 1
              },
              raisedOn: MOCK_NOW.toISOString(),
              raisedBy: 'business@email.com'
            }
          }
        }
      },
      when: {
        entities: []
      },
      expect: {
        applicationstatusBinding: [
          {
            PartitionKey: 'ref',
            RowKey: `ref_${MOCK_NOW.getTime()}`,
            EventId: 'eventID',
            EventType: 'event-type',
            Status: 'success',
            Payload: {
              reference: 'ref',
              statusId: 1
            },
            ChangedBy: 'business@email.com',
            ChangedOn: MOCK_NOW.toISOString()
          }
        ],
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Creating the table client using the DefaultAzureCredential: ${JSON.stringify(
            {
              tableName: 'ffcahwrapplicationstatus'
            }
          )}`,
          `${MOCK_NOW.toISOString()} 'application-status-event' created: ${JSON.stringify(
            {
              PartitionKey: 'ref',
              RowKey: `ref_${MOCK_NOW.getTime()}`,
              EventId: 'eventID',
              EventType: 'event-type',
              Status: 'success',
              Payload: {
                reference: 'ref',
                statusId: 1
              },
              ChangedBy: 'business@email.com',
              ChangedOn: MOCK_NOW.toISOString()
            }
          )}`,
          `${MOCK_NOW.toISOString()} 'application-status-event' has been saved successfully: ${JSON.stringify(
            {
              partitionKey: 'ref',
              rowKey: `ref_${MOCK_NOW.getTime()}`
            }
          )}`
        ]
      }
    },
    {
      toString: () => 'duplicate',
      given: {
        context: {
          bindings: {}
        },
        event: {
          name: 'application-status-event',
          properties: {
            id: 'eventID',
            sbi: '123456789',
            status: 'success',
            action: {
              type: 'event-type',
              data: {
                reference: 'ref',
                statusId: 1
              },
              raisedOn: MOCK_NOW.toISOString(),
              raisedBy: 'business@email.com'
            }
          }
        }
      },
      when: {
        entities: [
          { PartitionKey: '123456789', RowKey: '123456789_', event: 'event1' }
        ]
      },
      expect: {
        applicationstatusBinding: [
          {
            PartitionKey: 'ref',
            RowKey: `eventID_${MOCK_NOW.getTime()}`,
            EventId: 'eventID',
            EventType: 'event-type',
            Status: 'duplicate event',
            Payload: {
              reference: 'ref',
              statusId: 1
            },
            ChangedBy: 'business@email.com',
            ChangedOn: MOCK_NOW.toISOString()
          }
        ],
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Creating the table client using the DefaultAzureCredential: ${JSON.stringify(
            {
              tableName: 'ffcahwrapplicationstatus'
            }
          )}`,
          `${MOCK_NOW.toISOString()} 'application-status-event' created: ${JSON.stringify(
            {
              PartitionKey: 'ref',
              RowKey: `eventID_${MOCK_NOW.getTime()}`,
              EventId: 'eventID',
              EventType: 'event-type',
              Status: 'duplicate event',
              Payload: {
                reference: 'ref',
                statusId: 1
              },
              ChangedBy: 'business@email.com',
              ChangedOn: MOCK_NOW.toISOString()
            }
          )}`,
          `${MOCK_NOW.toISOString()} 'application-status-event' has been saved successfully: ${JSON.stringify(
            {
              partitionKey: 'ref',
              rowKey: `eventID_${MOCK_NOW.getTime()}`
            }
          )}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    const mockEntities = testCase.when.entities

    mockListEntities.mockImplementation(() => ({
      [Symbol.asyncIterator]: () => ({
        i: 0,
        next () {
          if (this.i < mockEntities.length) {
            return Promise.resolve({ value: mockEntities[this.i++], done: false })
          }
          return Promise.resolve({ value: undefined, done: true })
        }
      })
    }))

    await onApplicationStatusEvent(
      testCase.given.context,
      testCase.given.event
    )

    expect(testCase.given.context.bindings.applicationstatusBinding).toEqual(
      testCase.expect.applicationstatusBinding
    )
    testCase.expect.consoleLogs.forEach((consoleLog, idx) =>
      expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
  })
})
