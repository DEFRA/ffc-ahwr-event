import { createTableClient } from '../../../ffc-ahwr-event/azure-storage/create-table-client.mjs'
import { saveMonitoring } from '../../../ffc-ahwr-event/monitoring/monitoring.mjs'

jest.mock('../../../ffc-ahwr-event/azure-storage/create-table-client')

describe('Monitoring function', () => {
  test('saveMonitoring', async () => {
    const context = {
      bindings: {
        tableMonitoringBinding: []
      }
    }
    const event = {
      properties: {
        id: '13345',
        action: {
          type: 'action',
          raisedOn: Date.now(),
          raisedBy: 'user'
        },
        status: 'status'
      }
    }
    const mockCreateTable = jest.fn()

    createTableClient.mockImplementationOnce(() => {
      return {
        createTable: mockCreateTable
      }
    })

    await saveMonitoring(context, event)

    expect(createTableClient).toHaveBeenCalledTimes(1)
    expect(mockCreateTable).toHaveBeenCalledTimes(1)
  })

  test('saveMonitoring defaults EventBy to unknown when raisedBy is absent', async () => {
    const context = {
      bindings: {
        tableMonitoringBinding: []
      }
    }
    const event = {
      properties: {
        id: '13345',
        action: {
          type: 'action',
          raisedOn: Date.now()
        },
        status: 'status'
      }
    }

    createTableClient.mockImplementationOnce(() => {
      return {
        createTable: jest.fn()
      }
    })

    await saveMonitoring(context, event)

    expect(context.bindings.tableMonitoringBinding[0].EventBy).toBe('unknown')
  })
})
