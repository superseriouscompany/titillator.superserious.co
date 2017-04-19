const models = {
  ranking: require('../models/ranking')
}

module.exports = function(app) {
  app.post('/rankings', createRanking)
}

function createRanking(req, res, next) {
  models.ranking.create('nope', req.body.ladder).then(() => {
    res.sendStatus(204)
  }).catch(next)
}
