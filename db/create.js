const client  = require('./client').lowLevel;
const schemas = require('./schema')

schemas.forEach((schema) => {
  client.createTable(schema, (err) => {
    if( err ) {
        if( err.code == 'ResourceInUseException' ) {
          return console.log(`${schema.TableName} already exists.`);
        }
        throw err;
    }

    console.log(`Created ${schema.TableName}`)
  })
})
