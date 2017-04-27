'use strict';
const AWS         = require('aws-sdk');
const secrets     = require('./secrets');
var environment = process.env.NODE_ENV || 'development';

module.exports = Object.assign({
  baseUrl:           'https://superserious.ngrok.io',
  awsRegion:         'eu-west-1',
  usersTableName:    'titillatorUsersStaging',
  rankingsTableName: 'titillatorRankingsStaging',
  stripeKey:         'sk_test_RW0na3DRBN8FFbqUMSwFVWM1',
}, require(`./${environment}`));

AWS.config.update({
  accessKeyId:     secrets.awsAccessKey,
  secretAccessKey: secrets.awsSecretKey,
  region:          module.exports.awsRegion,
});

module.exports.AWS = AWS;
