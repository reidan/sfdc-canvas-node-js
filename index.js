var express = require('express');
var bodyParser = require('body-parser');
var cryptoJS = require('crypto-js');
var hmacSHA256 = require('crypto-js/hmac-sha256');
var encBase64 = require('crypto-js/enc-base64');

var app = express();

app.set('port', (process.env.PORT || 5000));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.post('/canvas', function(request, response)  {

    // Receive the POST message that contains the initial signed request from Salesforce. DONE!
    // Split the signed request on the first period. The result is two strings: the hashed Based64 context signed with the consumer secret and the Base64 encoded context itself.
    // console.log( request );
    // console.log( request.body );
    console.log( request.body.signed_request );
    var reqBody = request.body;
    var signedReq = reqBody.signed_request;
    var index = signedReq.indexOf( '.' );
    console.log( index );
    var hashedBase64 = signedReq.substring(0, index);
    var signedHashedBase64 = signedReq.substring(index + 1, signedReq.length);


    //$calcedSig = base64_encode(hash_hmac("sha256", $encodedEnv, $consumer_secret, true));	
    // Use the HMAC SHA-256 algorithm to hash the Base64 encoded context and sign it using your consumer secret.
    var hash = hmacSHA256( signedHashedBase64, process.env.CONSUMER_SECRET );
    // Base64 encode the string created in the previous step.
    var encodedHash = encBase64.stringify( hash );
    // Compare the Base64 encoded string with the hashed Base64 context signed with the consumer secret you received in step 2.
    if( encodedHash !== hashedBase64 ) {
    	response.status( 500 );
    } else {
    	var signedRequest = encBase64.parse( signedHashedBase64 );
  		response.send( JSON.parse( CryptoJS.enc.Latin1.stringify( signedRequest ) ) );
    }
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


