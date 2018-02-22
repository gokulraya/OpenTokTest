// Dependencies
var express = require('express'),
  OpenTok = require('../../lib/opentok');
 path = require('path');
// Verify that the API Key and API Secret are defined
var apiKey = process.env.API_KEY,
  apiSecret = process.env.API_SECRET;
if (!apiKey || !apiSecret) {
  console.log('You must specify API_KEY and API_SECRET environment variables');
  process.exit(1);
}

// Initialize the express app
var app = express();
app.use(express.static(__dirname + '/public'));

// Initialize OpenTok
var opentok = new OpenTok(apiKey, apiSecret);

// Create a session and store it in the express app
opentok.createSession({
  mediaMode: 'routed'
}, function (err, session) {
  if (err) throw err;
  console.log("Initializing session...");
  app.set('sessionId', session.sessionId);
  // We will wait on starting the app until this is done
  init();
});
app.use('/public',express.static(path.join(__dirname, 'public')))


app.get('/', function (req, res) {
  var sessionId = app.get('sessionId'),
    // generate a fresh token for this client
    token = opentok.generateToken(sessionId);

  res.render('index.ejs', {
    apiKey: apiKey,
    sessionId: sessionId,
    token: token
  });
});

app.post('/start', function (req, res) {
  console.log("Archive Clicked");
  var sessionId = app.get('sessionId');
  opentok.startArchive(sessionId, {
    name: 'Gokul Test Archive'
  }, function (err, archive) {
    if (err) {
      return console.log(err);
    } else {
      // The id property is useful to save off into a database
      console.log("new archive:" + archive.id);
    }
  });

});

app.get('/stop/:archiveId', function (req, res) {
  var archiveId = req.param('archiveId');
  console.log("Stoppig archive ", archiveId);
  opentok.stopArchive(archiveId, function (err, archive) {
    if (err) return console.log(err);

    console.log("Stopped archive:" + archive.id);
  });


});

// Start the express app
function init() {
  app.listen(3000, function () {
    console.log('You\'re app is now ready at http://localhost:3000/');
  });
}