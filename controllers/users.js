const auth  = require('../middleware/auth')

const models = {
  user: require('../models/user')
}

module.exports = function(app) {
  app.post('/users', createUser)
  app.get('/coworkers', auth, coworkers)
}

function createUser(req, res, next) {
  models.user.create(req.body).then((user) => {
    res.status(201).json({access_token: user.access_token, user: user})
  }).catch((err) => {
    if( err.message === 'UserConflict' ) {
      return res.status(409).json({nope: false})
    }
    next(err)
  })
}

function coworkers(req, res, next) {
  models.user.findCoworkers(req.user).then((coworkers) => {
    return res.json({
      users: coworkers
    })
  }).catch(next)
}
