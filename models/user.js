const uuid      = require('uuid')
const client    = require('../db/client')
const tableName = require('../config').usersTableName

module.exports = {
  get:               get,
  create:            create,
  findByAccessToken: findByAccessToken,
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
  user = Object.assign({}, user, {access_token: uuid.v1()})

  return client.put({
    TableName: tableName,
    Item: user,
  }).then(() => {
    return user
  })
}


function findByAccessToken(accessToken) {
  if( !accessToken ) { return Promise.reject(new Error('InputError')) }
  return client.query({
    TableName: tableName,
    IndexName: 'access_token',
    KeyConditionExpression: 'access_token = :access_token',
    ExpressionAttributeValues: {
      ':access_token': accessToken
    },
    Limit: 1,
  }).then(function(user) {
    if( !user.Items.length ) { throw new Error('UserNotFound'); }
    return user.Items[0];
  })
}
