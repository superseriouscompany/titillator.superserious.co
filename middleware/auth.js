const models = {
  user:    require('../models/user'),
}

module.exports = function auth(req, res, next) {
  const token = req.get('X-Access-Token');
  if( !token ) { return res.status(401).json({error: "No access token provided"}) }

  models.user.findByAccessToken(token).then(function(user) {
    req.userId = user.id;
    req.user = user;
    next();
  }).catch(function(err) {
    if( err.message == 'UserNotFound' ) {
      return res.status(401).json({error: "Invalid Access Token", token: token});
    }
    next(err);
  })
}
