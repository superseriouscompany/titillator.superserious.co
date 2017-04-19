const models = {
  user: require('../models/user')
}

module.exports = function(app) {
  app.post('/users', createUser)
}

function createUser(req, res, next) {
  models.user.create(req.body).then((user) => {
    res.status(201).json({access_token: user.access_token, user: user})
  }).catch(next)
}
