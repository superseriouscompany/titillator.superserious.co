const client    = require('../db/client')
const tableName = require('../config').rankingsTableName

module.exports = {
  create: create,
  get: get,
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

function get(id) {
  return client.get({
    TableName: tableName,
    Key: {id: id}
  }).then((payload) => {
    return payload.Item
  })
}
