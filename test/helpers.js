module.exports = {
  shouldFail: shouldFail
}

function shouldFail(r) {
  var err;
  if( r && r.statusCode ) {
    err = new Error(`Expected an unsuccessful response, got: ${r.statusCode} ${JSON.stringify(r.body)}`);
    err.statusCode = r.statusCode;
    err.response = { body: r.body };
  } else {
    err = new Error(`Expected an unsuccessful response, got: ${r}`);
    err.statusCode = 420;
  }
  err.name = 'ShouldHaveFailed';
  throw err;
}
