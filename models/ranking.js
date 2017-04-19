const client    = require('../db/client')
const tableName = require('../config').rankingsTableName

module.exports = {
  create: create,
}

function create(id, ladder) {
  return client.put({
    TableName: tableName,
    Item: {
      id: id,
      ladder: ladder,
    },
  }).then(() => { return true })
}