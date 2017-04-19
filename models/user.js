const client    = require('../db/client')
const tableName = require('../config').usersTableName

module.exports = {
  get:    get,
  create: create,
}

function get(id) {
  return client.get({
    TableName: tableName,
    Key: { id: id },
  }).then((user) => {
    if( !user.Item ) { throw new Error('UserNotFound') }
    return user.Item;
  })
}

function create(user) {
  return client.put({
    TableName: tableName,
    Item: user,
  }).then(() => { return true })
}
