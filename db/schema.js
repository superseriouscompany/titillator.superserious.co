const config = require('../config');

module.exports = [{
  "TableName": config.usersTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"id",
      "AttributeType":"S"
    },
  ],
  "KeySchema":[
    {
      "AttributeName":"id",
      "KeyType":"HASH",
    },
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":1,
    "WriteCapacityUnits":1
  },
}, {
  "TableName": config.rankingsTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"userId",
      "AttributeType":"S"
    },
    {
      "AttributeName":"rankedId",
      "AttributeType":"S"
    },
  ],
  "KeySchema":[
    {
      "AttributeName":"userId",
      "KeyType":"HASH",
    },
    {
      "AttributeName":"rankedId",
      "KeyType":"RANGE",
    }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":1,
    "WriteCapacityUnits":1
  },
}]
