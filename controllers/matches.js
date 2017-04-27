const auth  = require('../middleware/auth')

const models = {
  matches:  require('../models/matches'),
  payments: require('../models/payments'),
  ranking:  require('../models/ranking'),
}

module.exports = function(app) {
  app.get('/matches', auth, getMatches)
  app.post('/matches/reveal', auth, revealMatch)
}

function getMatches(req, res, next) {
  models.matches.findByUserId(req.userId).then((users) => {
    res.json({
      count:    users.length,
      revealed: users.filter((u) => {
        return u.revealed
      })
    })
  }).catch((err) => {
    if( err.message === 'NoRanking' ) {
      return res.status(400).json({error: "No rankings submitted yet."})
    }
    next(err)
  })
}

function revealMatch(req, res, next) {
  var match;

  return Promise.resolve().then(() => {
    return models.matches.reveal(req.userId)
  }).then((m) => {
    match = m
    return models.ranking.markRevealed(req.userId, m.id)
  }).then(() => {
    return models.payments.pay(999, req.body.stripe_token, req.body.email)
  }).then((cool) => {
    res.json({match: match})
  }).catch((err) => {
    if( err.message === 'InvalidToken' ) {
      return res.status(400).json({
        error: 'Stripe token is invalid',
      })
    }
    if( err.message === 'NoMatch' ) {
      return res.status(410).json({
        error: 'No more matches',
      })
    }
    next(err)
  })
}
