const models = {
  user: require('../models/user')
}

module.exports = function(app) {
  app.post('/users', createUser)
}

function createUser(req, res, next) {
  models.user.create(req.body).then(() => {
    res.status(201).json({created: true})
  }).catch(next)
}
