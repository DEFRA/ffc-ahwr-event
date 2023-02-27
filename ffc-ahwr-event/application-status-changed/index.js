const onApplicationStatusChanged = async (context, event) => {
  console.log(`${new Date().toISOString()} Application status changed: ${JSON.stringify({ event })}`)

  const partitionKey = `${event.properties.sbi}`
  const rowKey = `${partitionKey}_${new Date(event.properties.action.raisedOn).getTime()}`

  context.bindings.tableBinding = []
  context.bindings.tableBinding.push({
    PartitionKey: partitionKey,
    RowKey: rowKey,
    Status: event.properties.action.data.status,
    Remark: event.properties.action.data.remark,
    ChangedBy: event.properties.action.raisedBy,
    ChangedOn: event.properties.action.raisedOn
  })

  console.log(`${new Date().toISOString()} Application Status Changed event has been saved successfully: ${JSON.stringify({
    partitionKey,
    rowKey
  })}`)
}

module.exports = onApplicationStatusChanged
