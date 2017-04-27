const client    = require('../db/client')
const tableName = require('../config').rankingsTableName

module.exports = {
  create: create,
  get: get,
  markRevealed: markRevealed,
}

function create(id, ladder) {
  return client.put({
    TableName: tableName,
    Item: {
      id: id,
      ladder: (ladder || []).sort((a, b) => {
        return a[1] < b[1] ? 1 : -1
      }),
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

function markRevealed(userId, id) {
  return get(userId).then((ranking) => {
    const revealed = (ranking.revealed || []).concat(id)

    return client.update({
      TableName:                 tableName,
      Key:                       { id: userId },
      UpdateExpression:          'set #revealed = :revealed',
      ExpressionAttributeValues: { ':revealed': revealed},
      ExpressionAttributeNames:  { '#revealed': 'revealed'},
    })
  })
}
