'use strict';
const AWS         = require('aws-sdk');
const secrets     = require('./secrets');
let environment = process.env.NODE_ENV || 'development';

module.exports = Object.assign({
  baseUrl:                 'https://superserious.ngrok.io',
  awsRegion:               'eu-west-1',
}, require(`./${environment}`));

AWS.config.update({
  accessKeyId:     secrets.awsAccessKey,
  secretAccessKey: secrets.awsSecretKey,
  region:          module.exports.awsRegion,
});

module.exports.AWS = AWS;
