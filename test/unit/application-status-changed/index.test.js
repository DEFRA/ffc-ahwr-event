const MOCK_NOW = new Date()

describe('On Application Status Changed', () => {
  let logSpy

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)

    logSpy = jest.spyOn(console, 'log')
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  test.each([
    {
      toString: () => 'Application status changed',
      given: {
        context: {
          bindings: {}
        },
        event: {
          name: 'application-status-changed',
          properties: {
            id: 'eventID',
            sbi: '123456789',
            status: 'success',
            action: {
              data: {
                applicationStatus: 'AGREED',
                remark: 'Remark'
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
        tableBinding: [
          {
            PartitionKey: '123456789',
            RowKey: `123456789_${MOCK_NOW.getTime()}`,
            Status: 'success',
            ChangedBy: 'business@email.com',
            ChangedOn: MOCK_NOW.toISOString(),
            Remark: 'Remark',
            ApplicationStatus: 'AGREED'
          }
        ],
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Application status changed: ${JSON.stringify({
            event: {
              name: 'application-status-changed',
              properties: {
                id: 'eventID',
                sbi: '123456789',
                status: 'success',
                action: {
                  data: {
                    applicationStatus: 'AGREED',
                    remark: 'Remark'
                  },
                  raisedOn: MOCK_NOW.toISOString(),
                  raisedBy: 'business@email.com'
                }
              }
            }
          })}`,
          `${MOCK_NOW.toISOString()} Creating the table client using the DefaultAzureCredential: ${JSON.stringify({
            tableName: 'ffcahwrapplicationstatus'
          })}`,
          `${MOCK_NOW.toISOString()} Application Status Changed event has been saved successfully: ${JSON.stringify({
            partitionKey: '123456789',
            rowKey: `123456789_${MOCK_NOW.getTime()}`
          })}`
        ]
      }
    },
    {
      toString: () => 'A duplicate event',
      given: {
        context: {
          bindings: {}
        },
        event: {
          name: 'application-status-changed',
          properties: {
            id: 'eventID',
            sbi: '123456789',
            status: 'success',
            action: {
              data: {
                applicationStatus: 'AGREED',
                remark: 'Remark'
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
        tableBinding: [
          {
            PartitionKey: '123456789',
            RowKey: `eventID_${MOCK_NOW.getTime()}`,
            Status: 'duplicate event',
            ChangedBy: 'business@email.com',
            ChangedOn: MOCK_NOW.toISOString(),
            Remark: 'Remark',
            ApplicationStatus: 'AGREED'
          }
        ],
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Application status changed: ${JSON.stringify({
            event: {
              name: 'application-status-changed',
              properties: {
                id: 'eventID',
                sbi: '123456789',
                status: 'success',
                action: {
                  data: {
                    applicationStatus: 'AGREED',
                    remark: 'Remark'
                  },
                  raisedOn: MOCK_NOW.toISOString(),
                  raisedBy: 'business@email.com'
                }
              }
            }
          })}`,
          `${MOCK_NOW.toISOString()} Creating the table client using the DefaultAzureCredential: ${JSON.stringify({
            tableName: 'ffcahwrapplicationstatus'
          })}`,
          `${MOCK_NOW.toISOString()} Application Status Changed event has been saved successfully: ${JSON.stringify({
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

    const onApplicationStatusChanged = require('../../../ffc-ahwr-event/application-status-changed')
    await onApplicationStatusChanged(
      testCase.given.context,
      testCase.given.event
    )

    expect(testCase.given.context.bindings.tableBinding).toEqual(testCase.expect.tableBinding)
    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
  })
})
