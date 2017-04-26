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
  }
}
