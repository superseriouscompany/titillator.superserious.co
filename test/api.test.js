const expect = require('expect')
const server = require('../index')
const api    = require('./api')

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

  it("allows creating a user", function () {
    return api.post('/users', {
      body: {
        id: 'nope',
        good: 'great',
        cool: 'nice'
      }
    }).then((response) => {
      expect(response.statusCode).toEqual(201)
      expect(response.body.access_token).toExist()
    })
  });

  it("allows submitting rankings", function () {
    return api.post('/rankings', {
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
  });
})
