const auth  = require('../middleware/auth')

const models = {
  ranking: require('../models/ranking'),
}

module.exports = function(app) {
  app.post('/rankings', auth, createRanking)
}

function createRanking(req, res, next) {
  models.ranking.create(req.user.id, req.body.ladder).then(() => {
    res.sendStatus(204)
  }).catch(next)
}
