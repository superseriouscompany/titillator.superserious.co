const models = {
  ranking: require('../models/ranking'),
  user:    require('../models/user'),
}

module.exports = {
  findByUserId: findByUserId,
}

function findByUserId(userId) {
  return Promise.resolve().then(() => {
    return models.ranking.get(userId)
  }).then((ranking) => {
    if( !ranking ) { throw new Error('NoRanking') }

    // TODO: use batchGet
    const topTen = ranking.ladder.slice(0, 10).map((r) => {
      return models.ranking.get(r[0])
    })

    return Promise.all(topTen)
  }).then((othersRankings) => {
    return othersRankings.filter((ranking) => {
      const ladder = ranking && ranking.ladder
      return !!(ladder || []).slice(0, 10).find((rung) => {
        return rung[0] === userId
      })
    })
  }).then((rankings) => {
    // TODO: use batchGet
    return Promise.all(rankings.map((r) => {
      return models.user.get(r.id)
    }))
  })
}
