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


// Example stripe response
// { id: 'ch_1ADGBRF8vO0S7pymh9uU1kiQ',
//   object: 'charge',
//   amount: 999,
//   amount_refunded: 0,
//   application: null,
//   application_fee: null,
//   balance_transaction: 'txn_1ADGBRF8vO0S7pymOtluHZn0',
//   captured: true,
//   created: 1493313217,
//   currency: 'usd',
//   customer: null,
//   description: null,
//   destination: null,
//   dispute: null,
//   failure_code: null,
//   failure_message: null,
//   fraud_details: {},
//   invoice: null,
//   livemode: false,
//   metadata: { email: 'noemail' },
//   on_behalf_of: null,
//   order: null,
//   outcome:
//    { network_status: 'approved_by_network',
//      reason: null,
//      risk_level: 'normal',
//      seller_message: 'Payment complete.',
//      type: 'authorized' },
//   paid: true,
//   receipt_email: null,
//   receipt_number: null,
//   refunded: false,
//   refunds:
//    { object: 'list',
//      data: [],
//      has_more: false,
//      total_count: 0,
//      url: '/v1/charges/ch_1ADGBRF8vO0S7pymh9uU1kiQ/refunds' },
//   review: null,
//   shipping: null,
//   source:
//    { id: 'card_1ADGBNF8vO0S7pymqVe2ZUGP',
//      object: 'card',
//      address_city: null,
//      address_country: null,
//      address_line1: null,
//      address_line1_check: null,
//      address_line2: null,
//      address_state: null,
//      address_zip: null,
//      address_zip_check: null,
//      brand: 'Visa',
//      country: 'US',
//      customer: null,
//      cvc_check: 'pass',
//      dynamic_last4: null,
//      exp_month: 7,
//      exp_year: 2019,
//      fingerprint: 'UkannT816sw9Cz73',
//      funding: 'unknown',
//      last4: '1111',
//      metadata: {},
//      name: 'neil.r.sarkar@gmail.com',
//      tokenization_method: null },
//   source_transfer: null,
//   statement_descriptor: null,
//   status: 'succeeded',
//   transfer_group: null }
