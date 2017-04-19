const uuid      = require('uuid')
const client    = require('../db/client')
const tableName = require('../config').usersTableName
const _         = require('lodash')

module.exports = {
  get:               get,
  create:            create,
  findByAccessToken: findByAccessToken,
  findCoworkers:     findCoworkers,
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
  }).then(function(payload) {
    if( !payload.Items.length ) { throw new Error('UserNotFound'); }
    return payload.Items[0];
  })
}

function findCoworkers(user, prepop) {
  const positions = _.map(user.positions.values, 'company')
  return client.scan({
    TableName: tableName,
  }).then((payload) => {
    console.log(payload.Items)
    return payload.Items.filter((p) => {
      if( p.id === user.id ) { return false }
      if( !p.positions || !p.positions.values ) { return false}
      const theirPositions = _.map(p.positions.values, 'company')
      console.log(_.map(positions, 'id'), _.map(theirPositions, 'id'))//,a[positions)
      return !!_.intersectionBy(positions, theirPositions, 'id').length
    })
  }).then((coworkers) => {
    return coworkers
  })
}
