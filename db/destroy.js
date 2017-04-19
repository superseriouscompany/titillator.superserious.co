const client  = require('./client')
const schemas = require('./schema')

schemas.forEach((schema) => {
  client.truncate(schema.TableName, schema).then(() => {
    console.log(`Truncated ${schema.TableName}`)
  }).catch((err) => {
    console.error(err, err.stack);
  })
})
