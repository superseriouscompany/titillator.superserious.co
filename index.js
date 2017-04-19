const express = require('express')
const app     = express()

const port = process.env.PORT || 3001

app.get('/', function(req, res) {
  res.json({
    version: 1,
  })
})

app.listen(port, function() {
  console.log(`Listening on ${port}...`)
})
