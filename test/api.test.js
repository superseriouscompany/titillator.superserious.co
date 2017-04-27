const expect  = require('expect')
const server  = require('../index')
const api     = require('./api')
const factory = require('./factory')
const h       = require('./helpers')

describe('api', function() {
  var serverHandle;
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

  it("doesn't allow getting an access token for an existing user", function () {
    return factory.user({id: 'cool', publicProfileUrl: 'http://cool/nice'}).then(() => {
      return factory.user({id: 'nope', publicProfileUrl: 'http://cool/nice'})
    }).then(h.shouldFail).catch((err) => {
      expect(err.statusCode).toEqual(409)
    })
  });

  it("returns match count", function() {
    var u1, u2;

    return Promise.all([
      factory.user(),
      factory.user()
    ]).then((v) => {
      u1 = v[0]
      u2 = v[1]

      return factory.match(u1, u2)
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
    var u1, u2;

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
            [Math.random().toString(), 4, 1],
            [Math.random().toString(), 4, 1],
            [Math.random().toString(), 4, 1],
            [Math.random().toString(), 3, 1],
            [Math.random().toString(), 2, 1],
            [Math.random().toString(), 1, 1],
            [Math.random().toString(), 1, 1],
            [Math.random().toString(), 1, 1],
            [Math.random().toString(), 1, 1],
            [Math.random().toString(), 1, 1],
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
    var users;

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

  it("allows you to pay to reveal a match", function () {
    var u1, u2;

    return Promise.all([
      factory.user(),
      factory.user({name: 'Sancho Panza'}),
    ]).then((v) => {
      u1 = v[0]
      u2 = v[1]

      return factory.match(u1, u2)
    }).then(() => {
      return api.post('/matches/reveal', {
        headers: { 'X-Access-Token': u1.access_token },
        body: {
          stripe_token: 'magic',
        }
      })
    }).then((response) => {
      expect(response.statusCode).toEqual(200)
      expect(response.body.match).toExist()
      expect(response.body.match.name).toEqual('Sancho Panza', `Expected ${JSON.stringify(response.body)} to contain Sancho Panza`)
    })
  });

  it("validates Stripe token", function () {
    var u1, u2;

    return Promise.all([
      factory.user(),
      factory.user({name: 'Sancho Panza'}),
    ]).then((v) => {
      u1 = v[0]
      u2 = v[1]

      return factory.match(u1, u2)
    }).then(() => {
      return api.post('/matches/reveal', {
        headers: { 'X-Access-Token': u1.access_token },
        body: {
          stripe_token: 'nope',
        }
      })
    }).then(h.shouldFail).catch((err) => {
      expect(err.statusCode).toEqual(400)
      expect(err.response.body.error).toMatch('token')
    })
  });

  it("reveals multiple matches", function () {
    var u1, u2, u3, u4;
    var matches, responses = [];

    return Promise.all([
      factory.user(),
      factory.user({name: 'Alex'}),
      factory.user({name: 'Barbara'}),
      factory.user({name: 'Christina'}),
    ]).then((v) => {
      u1 = v[0]
      u2 = v[1]
      u3 = v[2]
      u4 = v[3]

      return api.post('/rankings', {
        headers: { 'X-Access-Token': u1.access_token },
        body: {
          ladder: [
            [u2.id, 3, 0],
            [u3.id, 2, 1],
            [u4.id, 1, 2],
          ]
        }
      })
    }).then(() => {
      return api.post('/rankings', {
        headers: { 'X-Access-Token': u2.access_token },
        body: {
          ladder: [
            [u1.id, 3, 0],
          ]
        }
      })
    }).then(() => {
      return api.post('/rankings', {
        headers: { 'X-Access-Token': u3.access_token },
        body: {
          ladder: [
            [u1.id, 3, 0],
          ]
        }
      })
    }).then(() => {
      return api.post('/rankings', {
        headers: { 'X-Access-Token': u4.access_token },
        body: {
          ladder: [
            [u1.id, 3, 0],
          ]
        }
      })
    }).then(() => {
      return api.post('/matches/reveal', {
        headers: { 'X-Access-Token': u1.access_token },
        body: {
          stripe_token: 'magic',
        }
      })
    }).then((response) => {
      responses = responses.concat(response)
      return api.post('/matches/reveal', {
        headers: { 'X-Access-Token': u1.access_token },
        body: {
          stripe_token: 'magic',
        }
      })
    }).then((response) => {
      responses = responses.concat(response)
      return api.post('/matches/reveal', {
        headers: { 'X-Access-Token': u1.access_token },
        body: {
          stripe_token: 'magic',
        }
      })
    }).then((response) => {
      responses = responses.concat(response)
      const statuses = responses.map((r) => { return r.statusCode })
      const names = responses.map((r) => { return r.body.match.name }).sort((a, b) => {
        return a < b ? -1 : 1
      })
      expect(statuses).toEqual([200,200,200])
      expect(names).toEqual(['Alex','Barbara','Christina'])
      return api.post('/matches/reveal', {
        headers: { 'X-Access-Token': u1.access_token },
        body: {
          stripe_token: 'magic',
        }
      })
    }).then(h.shouldFail).catch((err) => {
      if( !err.statusCode ) { throw err; }
      expect(err.statusCode).toEqual(410)
    })
  });

  it("remembers matches you've revealed", function () {
    var u1, u2;

    return Promise.all([
      factory.user(),
      factory.user({name: 'Sancho Panza'}),
    ]).then((v) => {
      u1 = v[0]
      u2 = v[1]

      return factory.match(u1, u2)
    }).then(() => {
      return api.post('/matches/reveal', {
        headers: { 'X-Access-Token': u1.access_token },
        body: {
          stripe_token: 'magic',
        }
      })
    }).then((response) => {
      return api.get('/matches', {
        headers: { 'X-Access-Token': u1.access_token },
      })
    }).then((response) => {
      expect(response.body.revealed).toExist()
      expect(response.body.revealed[0].name).toEqual('Sancho Panza', `Expected ${JSON.stringify(response.body)} to contain Sancho Panza`)
    })
  });
})
