const onApplicationStatusChanged = require('../../../ffc-ahwr-event/application-status-changed')

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
  })

  test.each([
    {
      toString: () => 'An application status changed event came',
      given: {
        context: {
          bindings: {}
        },
        event: {
          name: 'application-status-changed',
          properties: {
            sbi: '123456789',
            action: {
              data: {
                status: 'AGREED',
                remark: 'Remark'
              },
              raisedOn: MOCK_NOW.toISOString(),
              raisedBy: 'business@email.com'
            }
          }
        }
      },
      when: {
      },
      expect: {
        tableBinding: [
          {
            PartitionKey: '123456789',
            RowKey: `123456789_${MOCK_NOW.getTime()}`,
            ChangedBy: 'business@email.com',
            ChangedOn: MOCK_NOW.toISOString(),
            Remark: 'Remark',
            Status: 'AGREED'
          }
        ],
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Application status changed: ${JSON.stringify({
            event: {
              name: 'application-status-changed',
              properties: {
                sbi: '123456789',
                action: {
                  data: {
                    status: 'AGREED',
                    remark: 'Remark'
                  },
                  raisedOn: MOCK_NOW.toISOString(),
                  raisedBy: 'business@email.com'
                }
              }
            }
          })}`,
          `${MOCK_NOW.toISOString()} Application Status Changed event has been saved successfully: ${JSON.stringify({
            partitionKey: '123456789',
            rowKey: `123456789_${MOCK_NOW.getTime()}`
          })}`
        ]
      }
    }
  ])('%s', async (testCase) => {
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
