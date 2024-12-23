import { onApplicationStatusEvent } from '../../../ffc-ahwr-event/application-status-event'

const mockListEntities = jest.fn()

jest.mock('@azure/data-tables', () => {
  return {
    odata: jest.fn(),
    TableClient: jest.fn().mockImplementation(() => {
      return {
        createTable: jest.fn(),
        listEntities: mockListEntities
      }
    })
  }
})

const MOCK_NOW = new Date()

describe('onApplicationStatusEvent', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(MOCK_NOW)
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
        ]
      }
    }
  ])('%s', async (testCase) => {
    const mockEntities = testCase.when.entities

    mockListEntities.mockReturnValue(mockEntities)

    await onApplicationStatusEvent(
      testCase.given.context,
      testCase.given.event
    )

    expect(testCase.given.context.bindings.applicationstatusBinding).toEqual(
      testCase.expect.applicationstatusBinding
    )
  })
})
