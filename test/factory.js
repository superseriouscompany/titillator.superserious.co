const api = require('./api')

module.exports = {
  user: function() {
    return api.post('/users', {
      body: {
        id:               'linkedinId',
        publicProfileUrl: 'https://www.linkedin.com/in/stubbly',
      }
    })
  }
}
