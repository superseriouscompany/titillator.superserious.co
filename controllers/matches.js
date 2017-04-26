const auth  = require('../middleware/auth')

const models = {
  matches: require('../models/matches'),
}

module.exports = function(app) {
  app.get('/matches', auth, getMatches)
}

function getMatches(req, res, next) {
  models.matches.findByUserId(req.userId).then((matchIds) => {
    res.json({count: matchIds.length})
  }).catch((err) => {
    if( err.message === 'NoRanking' ) {
      return res.status(400).json({error: "No rankings submitted yet."})
    }
    next(err)
  })
}
