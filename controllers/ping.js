module.exports = function(app) {
  app.get('/', ping)
}

function ping(req, res, next) {
  res.json({
    version: 1,
  })
}
