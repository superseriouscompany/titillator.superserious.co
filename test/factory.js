const api = require('./api')

module.exports = {
  user: function(fields) {
    const body = Object.assign({}, {
      id:               'linkedinId',
      publicProfileUrl: 'https://www.linkedin.com/in/stubbly',
    }, fields)

    return api.post('/users', {
      body: body
    })
  }
}
