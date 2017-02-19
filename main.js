  /*
TODO:
*/

var express = require('express');
const colors = require('colors');
var app = express();
var http = require('http')
var https = require('https')
var fs = require('fs');
// {OPTIONAL} var crypto = require('crypto')
var auth = require('basic-auth');
var port = 443;
var httpport = 80;
var options = {
    key: fs.readFileSync('ssl/privkey.pem'),
    cert: fs.readFileSync('ssl/cert.pem')
};
/*

//OPTIONAL REQUIRES

const mysql = require('mysql');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var sql = mysql.createConnection({host: 'localhost', user: 'root', password: 'mypass', database: 'mydb'});

//Prevents MySQL Database from dying
setInterval(function() {
    sql.query('SELECT 1');
}, 10000);

*/



//Logging functions
var log = {
    error: function(data) {
        var date = new Date();
        console.log('ERROR'.red, data);
    },
    info: function(data) {
        var date = new Date();
        console.log('INFO'.green, data);
    },
    warn: function(data) {
        var date = new Date();
        console.log('WARN'.yellow, data);
    },
    debug: function(data) {
        console.log('DEBUG'.blue, data);
    }
}

/*
//AES ENCRYPTION EXAMPLE

function encrypt(text) {
    var algorithm = 'aes256'
    var password = 'CHANGEME__'
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var algorithm = 'aes256'
    var password = 'CHANGEME__
    var decipher = crypto.createDecipher(algorithm, password)
    try {
        var dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    } catch (ex) {
        return "ERROR";
    }
}
*/

//Starting up HTTP and HTTPS
var server = https.createServer(options, app).listen(port, function() {
    log.info("Express server listening on port " + port);
});

var serverhttp = http.createServer(app).listen(httpport, function() {
    log.info("Express server listening on port " + httpport);
});
serverhttp.listen(httpport);

//SOCKET.IO INIT
var io = require('socket.io')(server)


//ONLY ENABLE IF HTTPS IS ENABLED
app.use(function(req, res, next) {
    if (req.secure) {
        next();
        log.info("[" + req.connection.remoteAddress +'] GET ' + req.url)
    } else {
        // request was via http, so redirect to https
        res.redirect('https://' + req.headers.host + req.url); //req.headers.host
        log.debug("Redirected" + req.connection.remoteAddress + " to HTTPS.");
    }
});

app.use(express.static(__dirname + '/web'));

app.get('/', function(req, res) {
    res.sendFile('web/index.html');
});


/*

//HTTP AUTH EXAMPLE
app.get('/auth', function(req, res) {
    var credentials = auth(req)
    if (!credentials || credentials.name !== 'username' || credentials.pass !== 'password') {
      res.statusCode = 401
      res.setHeader('WWW-Authenticate', 'Basic realm="example"')
      res.end('Access denied')
    } else {
      log.debug(req.connection.remoteAddress + " GET /auth")
      res.sendFile('files');
  }
});
*/

//Custom 404
app.use(function(req, res) {
    res.send('404: Page not Found').status(404);
    log.warn(req.connection.remoteAddress + " [404] GET " + req.url)
});

io.on('connection', function(socket, next) {
    log.info(socket.handshake.address + " has connected.")

    socket.on('sending-info', function(data){
      console.log(data)
    })
})
