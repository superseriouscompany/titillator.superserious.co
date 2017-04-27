const employees = require('./employees')

const models = {
  ranking: require('../models/ranking'),
  user:    require('../models/user'),
}

module.exports = {
  findByUserId: findByUserId,
  reveal:       reveal,
}

function reveal(userId) {
  let match;

  return Promise.resolve().then(() => {
    return models.ranking.get(userId)
  }).then((ranking) => {
    if( !ranking ) { throw new Error('NoRanking') }

    const revelations = (ranking.revealed || [])

    const matches = ranking.ladder.slice(0, 10).filter((l) => {
      for( var i = 0; i < revelations.length; i++ ) {
        if( revelations[i] === l[0] ) {
          return false
        }
      }
      return true
    })

    if( !matches.length ) { throw new Error('NoMatch') }

    const match = matches[Math.floor(Math.random()*matches.length)];
    const id = match[0]

    if( process.env.NODE_ENV !== 'production' ) {
      const match = employees.find((e) => { return e.id === id })
      if( match ) return match
    }

    return models.user.get(id)
  })
}

function findByUserId(userId) {
  let revealed = [];
  return Promise.resolve().then(() => {
    return models.ranking.get(userId)
  }).then((ranking) => {
    if( !ranking ) { throw new Error('NoRanking') }

    revealed = ranking.revealed
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
  }).then((users) => {
    return users.map((u) => {
      u.revealed = !!revealed.find((id) => { return u.id === id })
      return u
    })
  })
}
