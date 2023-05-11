const MOCK_NOW = new Date()

describe('onRegisterYourInterestEvent', () => {
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
          name: 'register-your-interest-event',
          properties: {
            id: 'a6a3a0c6-2e39-47bd-b067-c92186ddde94',
            sbi: 'n/a',
            cph: 'n/a',
            checkpoint: 'ffc-ahwr-eligibility-local',
            status: 'success',
            action: {
              type: 'gained_access_to_the_apply_journey',
              message: 'The user has gained access to the apply journey',
              data: {
                businessEmail: 'marcinmo@kainos.com',
                createdAt: '2023-05-05T14:24:24.543Z',
                accessGranted: true,
                accessGrantedAt: '2023-05-05T14:37:00.623Z'
              },
              raisedBy: 'marcinmo@kainos.com',
              raisedOn: MOCK_NOW.toISOString()
            }
          }
        }
      },
      when: {
        entities: []
      },
      expect: {
        registeryourinterestBinding: [
          {
            PartitionKey: 'marcinmo@kainos.com',
            RowKey: `marcinmo@kainos.com_${MOCK_NOW.getTime()}`,
            EventId: 'a6a3a0c6-2e39-47bd-b067-c92186ddde94',
            EventType: 'gained_access_to_the_apply_journey',
            Status: 'success',
            Payload: {
              businessEmail: 'marcinmo@kainos.com',
              createdAt: '2023-05-05T14:24:24.543Z',
              accessGranted: true,
              accessGrantedAt: '2023-05-05T14:37:00.623Z'
            },
            ChangedBy: 'marcinmo@kainos.com',
            ChangedOn: MOCK_NOW.toISOString()
          }
        ],
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Creating the table client using the DefaultAzureCredential: ${JSON.stringify({
            tableName: 'ffcahwrregisteryourinterest'
          })}`,
          `${MOCK_NOW.toISOString()} 'register-your-interest-event' created: ${JSON.stringify({
            PartitionKey: 'marcinmo@kainos.com',
            RowKey: `marcinmo@kainos.com_${MOCK_NOW.getTime()}`,
            EventId: 'a6a3a0c6-2e39-47bd-b067-c92186ddde94',
            EventType: 'gained_access_to_the_apply_journey',
            Status: 'success',
            Payload: {
              businessEmail: 'marcinmo@kainos.com',
              createdAt: '2023-05-05T14:24:24.543Z',
              accessGranted: true,
              accessGrantedAt: '2023-05-05T14:37:00.623Z'
            },
            ChangedBy: 'marcinmo@kainos.com',
            ChangedOn: MOCK_NOW.toISOString()
          })}`,
          `${MOCK_NOW.toISOString()} 'register-your-interest-event' has been saved successfully: ${JSON.stringify({
            partitionKey: 'marcinmo@kainos.com',
            rowKey: `marcinmo@kainos.com_${MOCK_NOW.getTime()}`
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
          name: 'register-your-interest-event',
          properties: {
            id: 'a6a3a0c6-2e39-47bd-b067-c92186ddde94',
            sbi: 'n/a',
            cph: 'n/a',
            checkpoint: 'ffc-ahwr-eligibility-local',
            status: 'success',
            action: {
              type: 'gained_access_to_the_apply_journey',
              message: 'The user has gained access to the apply journey',
              data: {
                businessEmail: 'marcinmo@kainos.com',
                createdAt: '2023-05-05T14:24:24.543Z',
                accessGranted: true,
                accessGrantedAt: '2023-05-05T14:37:00.623Z'
              },
              raisedBy: 'marcinmo@kainos.com',
              raisedOn: MOCK_NOW.toISOString()
            }
          }
        }
      },
      when: {
        entities: [
          { PartitionKey: 'marcinmo@kainos.com', RowKey: 'marcinmo@kainos.com_', event: 'event1' }
        ]
      },
      expect: {
        registeryourinterestBinding: [
          {
            PartitionKey: 'marcinmo@kainos.com',
            RowKey: `a6a3a0c6-2e39-47bd-b067-c92186ddde94_${MOCK_NOW.getTime()}`,
            EventId: 'a6a3a0c6-2e39-47bd-b067-c92186ddde94',
            EventType: 'gained_access_to_the_apply_journey',
            Status: 'duplicate event',
            Payload: {
              businessEmail: 'marcinmo@kainos.com',
              createdAt: '2023-05-05T14:24:24.543Z',
              accessGranted: true,
              accessGrantedAt: '2023-05-05T14:37:00.623Z'
            },
            ChangedBy: 'marcinmo@kainos.com',
            ChangedOn: MOCK_NOW.toISOString()
          }
        ],
        consoleLogs: [
          `${MOCK_NOW.toISOString()} Creating the table client using the DefaultAzureCredential: ${JSON.stringify({
            tableName: 'ffcahwrregisteryourinterest'
          })}`,
          `${MOCK_NOW.toISOString()} 'register-your-interest-event' created: ${JSON.stringify({
            PartitionKey: 'marcinmo@kainos.com',
            RowKey: `a6a3a0c6-2e39-47bd-b067-c92186ddde94_${MOCK_NOW.getTime()}`,
            EventId: 'a6a3a0c6-2e39-47bd-b067-c92186ddde94',
            EventType: 'gained_access_to_the_apply_journey',
            Status: 'duplicate event',
            Payload: {
              businessEmail: 'marcinmo@kainos.com',
              createdAt: '2023-05-05T14:24:24.543Z',
              accessGranted: true,
              accessGrantedAt: '2023-05-05T14:37:00.623Z'
            },
            ChangedBy: 'marcinmo@kainos.com',
            ChangedOn: MOCK_NOW.toISOString()
          })}`,
          `${MOCK_NOW.toISOString()} 'register-your-interest-event' has been saved successfully: ${JSON.stringify({
            partitionKey: 'marcinmo@kainos.com',
            rowKey: `a6a3a0c6-2e39-47bd-b067-c92186ddde94_${MOCK_NOW.getTime()}`
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

    const onRegisterYourInterestEvent = require('../../../ffc-ahwr-event/register-your-interest-event')
    await onRegisterYourInterestEvent(
      testCase.given.context,
      testCase.given.event
    )

    expect(testCase.given.context.bindings.registeryourinterestBinding).toEqual(testCase.expect.registeryourinterestBinding)
    testCase.expect.consoleLogs.forEach(
      (consoleLog, idx) => expect(logSpy).toHaveBeenNthCalledWith(idx + 1, consoleLog)
    )
  })
})
