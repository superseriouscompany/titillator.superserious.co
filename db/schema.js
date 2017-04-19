const config = require('../config');

module.exports = [{
  "TableName": config.usersTableName,
  "AttributeDefinitions":[
    {
      "AttributeName":"id",
      "AttributeType":"S"
    },
    {
      "AttributeName":"access_token",
      "AttributeType":"S",
    }
  ],
  "KeySchema":[
    {
      "AttributeName":"id",
      "KeyType":"HASH",
    },
  ],
  "GlobalSecondaryIndexes": [
    {
      "IndexName": "access_token",
      "KeySchema": [
        {
          "AttributeName": "access_token",
          "KeyType": "HASH"
        }
      ],
      "Projection": {
        "ProjectionType": "ALL",
      },
      "ProvisionedThroughput": {
        "ReadCapacityUnits":1,
        "WriteCapacityUnits":1
      },
    }
  ],
  "ProvisionedThroughput": {
    "ReadCapacityUnits":1,
    "WriteCapacityUnits":1
  },
}, {
  "TableName": config.rankingsTableName,
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
}]
