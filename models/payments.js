const config = require('../config')
const stripe = require('stripe')(config.stripeKey);

module.exports = {
  pay: function(amount, token, email) {
    if( process.env.NODE_ENV !== 'production' && token === 'magic' ) {
      return Promise.resolve()
    }

    return stripe.charges.create({
      amount: amount,
      currency: "usd",
      source: token,
      metadata: {
        email: email || "noemail"
      }
    }).then((cool) => {
      return cool
    }).catch((err) => {
      if( err.message && err.message.match("No such token") ) {
        throw new Error('InvalidToken')
      }
      throw err;
    })
  }
}
