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
  let match, revelations, matches;

  return Promise.resolve().then(() => {
    return findByUserId(userId)
  }).then((m) => {
    matches = m;
    return models.ranking.get(userId)
  }).then((ranking) => {
    if( !ranking ) { throw new Error('NoRanking') }
    revelations = (ranking.revealed || [])
    matches = matches.filter((m) => {
      for( var i = 0; i < revelations.length; i++ ) {
        if( revelations[i] === m.id ) {
          return false
        }
      }
      return true
    })

    if( !matches.length ) { throw new Error('NoMatch') }
    const match = matches[Math.floor(Math.random()*matches.length)];
    return match
  })
}

function findByUserId(userId) {
  let revealed = [];
  return Promise.resolve().then(() => {
    return models.ranking.get(userId)
  }).then((ranking) => {
    // Get my ranking
    if( !ranking ) { throw new Error('NoRanking') }

    revealed = ranking.revealed || []
    // TODO: use batchGet
    const topTen = ranking.ladder.slice(0, 10).map((r) => {
      if( process.env.NODE_ENV !== 'production' ) {
        const match = employees.find((e) => { return e.id === r[0] })
        if( match ) return match
      }
      return models.ranking.get(r[0])
    })

    return Promise.all(topTen)
  }).then((othersRankings) => {
    // Get rankings of everyone in my top ten
    return othersRankings.filter((ranking) => {
      const ladder = ranking && ranking.ladder
      return !!(ladder || []).slice(0, 10).find((rung) => {
        return rung[0] === userId
      })
    })
  }).then((rankings) => {
    // Get rankings that have me in their top ten

    return Promise.all(rankings.map((r) => {
      if( process.env.NODE_ENV !== 'production' ) {
        const match = employees.find((e) => { return e.id === r.id })
        if( match ) return match
      }
      return models.user.get(r.id)
    }))
  }).then((users) => {
    // Get user docs for everyone

    return users.map((u) => {
      u.revealed = !!revealed.find((id) => { return u.id === id })
      return u
    })
  })
}
