import { createTableClient } from '../../../ffc-ahwr-event/azure-storage/create-table-client'
import { saveMonitoring } from '../../../ffc-ahwr-event/monitoring/monitoring'

jest.mock('../../../ffc-ahwr-event/azure-storage/create-table-client')

describe('Monitoring function', () => {
  const mockLogInfo = jest.fn()

  test('saveMonitoring', async () => {
    const context = {
      bindings: {
        tableMonitoringBinding: []
      },
      log: {
        info: mockLogInfo
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
    expect(mockLogInfo).toHaveBeenCalledTimes(1)
  })
})
