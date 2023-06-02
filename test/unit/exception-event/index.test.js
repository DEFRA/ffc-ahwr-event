const MOCK_NOW = new Date()

describe('onExceptionEvent', () => {
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
        DefaultAzureCredential: jest.fn().mockImplementation(() => {
        })
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
          name: 'send-exception-event',
          properties: {
            id: 'eventID',
            sbi: '123456789',
            status: 'success',
            action: {
              type: 'exception-event',
              data: {
                sbi: '123456789',
                crn: 123456789
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
        exceptionBinding: [
          {
            PartitionKey: '123456789',
            RowKey: `123456789_${MOCK_NOW.getTime()}`,
            EventId: 'eventID',
            EventType: 'exception-event',
            Status: 'success',
            Payload: {
              sbi: '123456789',
              crn: 123456789
            },
            ChangedBy: 'business@email.com',
            ChangedOn: MOCK_NOW.toISOString()
          }
        ],
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Creating the table client using the DefaultAzureCredential: ${JSON.stringify({
            tableName: 'ffcahwrexception'
          })}`,
          `${MOCK_NOW.toISOString()} 'exception-event' created: ${JSON.stringify({
            PartitionKey: '123456789',
            RowKey: `123456789_${MOCK_NOW.getTime()}`,
            EventId: 'eventID',
            EventType: 'exception-event',
            Status: 'success',
            Payload: {
              sbi: '123456789',
              crn: 123456789
            },
            ChangedBy: 'business@email.com',
            ChangedOn: MOCK_NOW.toISOString()
          })}`,
          `${MOCK_NOW.toISOString()} 'exception-event' has been saved successfully: ${JSON.stringify({
            partitionKey: '123456789',
            rowKey: `123456789_${MOCK_NOW.getTime()}`
          })}`
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
          name: 'exception-event',
          properties: {
            id: 'eventID',
            sbi: '123456789',
            status: 'success',
            action: {
              type: 'exception-event',
              data: {
                sbi: '123456789',
                crn: 123456789
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
        exceptionBinding: [
          {
            PartitionKey: '123456789',
            RowKey: `eventID_${MOCK_NOW.getTime()}`,
            EventId: 'eventID',
            EventType: 'exception-event',
            Status: 'duplicate event',
            Payload: {
              sbi: '123456789',
              crn: 123456789
            },
            ChangedBy: 'business@email.com',
            ChangedOn: MOCK_NOW.toISOString()
          }
        ],
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Creating the table client using the DefaultAzureCredential: ${JSON.stringify({
            tableName: 'ffcahwrexception'
          })}`,
          `${MOCK_NOW.toISOString()} 'exception-event' created: ${JSON.stringify({
            PartitionKey: '123456789',
            RowKey: `eventID_${MOCK_NOW.getTime()}`,
            EventId: 'eventID',
            EventType: 'exception-event',
            Status: 'duplicate event',
            Payload: {
              sbi: '123456789',
              crn: 123456789
            },
            ChangedBy: 'business@email.com',
            ChangedOn: MOCK_NOW.toISOString()
          })}`,
          `${MOCK_NOW.toISOString()} 'exception-event' has been saved successfully: ${JSON.stringify({
            partitionKey: '123456789',
            rowKey: `eventID_${MOCK_NOW.getTime()}`
          })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
    const MOCK_ENTITIES = testCase.when.entities

    jest.mock('@azure/data-tables', () => {
      return {
        odata: jest.fn(),
        TableClient: jest.fn().mockImplementation(() => {
          return {
            createTable: jest.fn(),
            listEntities: jest.fn().mockImplementation(() => {
              return MOCK_ENTITIES
            })
          }
        })
      }
    })

    const onExceptionEvent = require('../../../ffc-ahwr-event/exception-event')
    await onExceptionEvent(
      testCase.given.context,
      testCase.given.event
    )

    expect(testCase.given.context.bindings.exceptionBinding).toEqual(testCase.expect.exceptionBinding)
    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
  })
})
