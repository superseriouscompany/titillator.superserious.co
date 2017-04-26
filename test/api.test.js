const expect  = require('expect')
const server  = require('../index')
const api     = require('./api')
const factory = require('./factory')
const h       = require('./helpers')

describe('api', function() {
  let serverHandle;
  this.slow(10000)
  this.timeout(20000)

  before(function() {
    serverHandle = server(4200)
  })

  after(function() {
    serverHandle()
  })

  it("provides healthcheck", function () {
    return api('/').then((response) => {
      expect(response.statusCode).toEqual(200)
      expect(response.body.version).toEqual(1)
    })
  });

  it("allows creating a user and rankings", function () {
    return api.post('/users', {
      body: {
        id: 'nope',
        good: 'great',
        cool: 'nice'
      }
    }).then((response) => {
      expect(response.statusCode).toEqual(201)
      expect(response.body.access_token).toExist()
      return api.post('/rankings', {
        headers: { 'X-Access-Token': response.body.access_token },
        body: {
          ladder: [
            [37, 0, 29],
            [36, 1, 70],
            [36, 1, 40],
          ]
        }
      }).then((response) => {
        expect(response.statusCode).toEqual(204)
      })
    })
  });

  it("allows getting coworkers", function () {
    return factory.user().then((user) => {
      return api.get('/coworkers', {
        headers: { 'X-Access-Token': user.access_token },
      }).then((response) => {
        expect(response.statusCode).toEqual(200)
        expect(response.body.users.length).toEqual(0)
      })
    })
  });

  it("actually gets matching coworkers :)")

  it("doesn't allow getting an access token for an existing user", function () {
    return factory.user({id: 'cool', publicProfileUrl: 'http://cool/nice'}).then(() => {
      return factory.user({id: 'nope', publicProfileUrl: 'http://cool/nice'})
    }).then(h.shouldFail).catch((err) => {
      expect(err.statusCode).toEqual(409)
    })
  });

  it("returns match count", function() {
    let u1, u2;

    return Promise.all([
      factory.user(),
      factory.user()
    ]).then((v) => {
      u1 = v[0]
      u2 = v[1]

      return api.post('/rankings', {
        headers: { 'X-Access-Token': u1.access_token },
        body: {
          ladder: [
            [u2.id, 1, 0],
          ]
        }
      })
    }).then(() => {
      return api.post('/rankings', {
        headers: { 'X-Access-Token': u2.access_token },
        body: {
          ladder: [
            [u1.id, 1, 0],
          ]
        }
      })
    }).then(() => {
      return api.get('/matches', {
        headers: { 'X-Access-Token': u1.access_token },
      })
    }).then((response) => {
      expect(response.statusCode).toEqual(200)
      expect(response.body.count).toEqual(1)

      return  api.get('/matches', {
        headers: { 'X-Access-Token': u2.access_token },
      })
    }).then((response) => {
      expect(response.statusCode).toEqual(200)
      expect(response.body.count).toEqual(1)
    })
  });

  it("returns no matches if your admirer is not in your top ten", function() {
    let u1, u2;

    return Promise.all([
      factory.user(),
      factory.user()
    ]).then((v) => {
      u1 = v[0]
      u2 = v[1]

      return api.post('/rankings', {
        headers: { 'X-Access-Token': u1.access_token },
        body: {
          ladder: [
            [Math.random().toString(), 0, 1],
            [Math.random().toString(), 0, 1],
            [Math.random().toString(), 0, 1],
            [Math.random().toString(), 0, 1],
            [Math.random().toString(), 0, 1],
            [Math.random().toString(), 0, 1],
            [Math.random().toString(), 0, 1],
            [Math.random().toString(), 0, 1],
            [Math.random().toString(), 0, 1],
            [Math.random().toString(), 0, 1],
            [u2.id, 0, 1],
          ]
        }
      })
    }).then(() => {
      return api.post('/rankings', {
        headers: { 'X-Access-Token': u2.access_token },
        body: {
          ladder: [
            [u1.id, 1, 0],
          ]
        }
      })
    }).then(() => {
      return api.get('/matches', {
        headers: { 'X-Access-Token': u1.access_token },
      })
    }).then((response) => {
      expect(response.statusCode).toEqual(200)
      expect(response.body.count).toEqual(0)

      return  api.get('/matches', {
        headers: { 'X-Access-Token': u2.access_token },
      })
    }).then((response) => {
      expect(response.statusCode).toEqual(200)
      expect(response.body.count).toEqual(0)
    })
  });

  it("400s if you haven't done any rankings", function () {
    return Promise.resolve().then(() => {
      return factory.user()
    }).then((u) => {
      return api.get('/matches', {
        headers: { 'X-Access-Token': u.access_token },
      })
    }).then(h.shouldFail).catch((err) => {
      expect(err.statusCode).toEqual(400)
    })
  });

  it("returns proper count for multiple matches", function() {
    let users;

    return Promise.all([
      factory.user(),
      factory.user(),
      factory.user(),
      factory.user(),
    ]).then((v) => {
      users = v;

      const rankings = [
        {
          ladder: [
            [ users[1].id, 1, 0, ],
            [ users[2].id, 1, 0, ],
            [ users[3].id, 1, 0, ],
          ]
        },
        {
          ladder: [
            [ users[0].id, 1, 0, ],
            [ users[2].id, 1, 0, ],
            [ users[3].id, 1, 0, ],
          ]
        },
        {
          ladder: [
            [ users[0].id, 1, 0, ],
            [ users[1].id, 1, 0, ],
            [ users[3].id, 1, 0, ],
          ]
        },
        {
          ladder: [
            [ users[0].id, 1, 0, ],
            [ users[1].id, 1, 0, ],
            [ users[2].id, 1, 0, ],
          ]
        },
      ]

      return Promise.all(rankings.map((r, i) => {
        return api.post('/rankings', {
          headers: { 'X-Access-Token': users[i].access_token },
          body: {
            ladder: r.ladder,
          }
        })
      }))
    }).then(() => {
      return Promise.all(users.map((u) => {
        return api.get('/matches', {
          headers: { 'X-Access-Token': u.access_token },
        })
      }))
    }).then((responses) => {
      responses.forEach((response) => {
        expect(response.body.count).toEqual(3)
      })
    })
  })
})
