const api = require('./api')

module.exports = {
  user: function(fields) {
    const id = Math.random()
    const body = Object.assign({}, {
      id:               id,
      publicProfileUrl: `https://www.linkedin.com/in/${id}`,
    }, fields)

    return api.post('/users', {
      body: body
    }).then((response) =>{
      return response.body.user
    })
  },

  match: function(u1, u2) {
    return api.post('/rankings', {
      headers: { 'X-Access-Token': u1.access_token },
      body: {
        ladder: [
          [u2.id, 2, 0],
        ]
      }
    }).then(() => {
      return api.post('/rankings', {
        headers: { 'X-Access-Token': u2.access_token },
        body: {
          ladder: [
            [u1.id, 2, 0],
          ]
        }
      })
    })
  },
}
