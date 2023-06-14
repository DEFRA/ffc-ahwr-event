describe('Monitoring function', () => {
  const mockCreateTableClient = require('../../../ffc-ahwr-event/azure-storage/create-table-client')
  jest.mock('../../../ffc-ahwr-event/azure-storage/create-table-client')
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
    mockCreateTableClient.mockImplementationOnce(() => {
      return {
        createTable: mockCreateTable
      }
    })
    const monitoring = require('../../../ffc-ahwr-event/monitoring/monitoring')
    await monitoring.saveMonitoring(context, event)
    expect(mockCreateTableClient).toHaveBeenCalledTimes(1)
    expect(mockCreateTable).toHaveBeenCalledTimes(1)
    expect(mockLogInfo).toHaveBeenCalledTimes(1)
  })
})
