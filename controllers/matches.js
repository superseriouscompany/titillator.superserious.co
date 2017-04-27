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
  return res.json({count: 1})
  models.matches.findByUserId(req.userId).then((matchIds) => {
    res.json({count: matchIds.length})
  }).catch((err) => {
    if( err.message === 'NoRanking' ) {
      return res.status(400).json({error: "No rankings submitted yet."})
    }
    next(err)
  })
}

function revealMatch(req, res, next) {
  return Promise.resolve().then(() => {
    return models.matches.reveal(req.userId)
  }).then((match) => {
    return models.payments.pay(999, req.body.stripe_token, req.body.email).then((cool) => {
      res.json({match: match})
    }).then(() => {
      return models.ranking.markRevealed(req.userId, match.id)
    })
  }).catch((err) => {
    if( err.message === 'InvalidToken' ) {
      return res.status(400).json({
        error: 'Stripe token is invalid',
      })
    }
    next(err)
  })
}
