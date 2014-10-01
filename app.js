// app.js
// 2014 ExPHAT (Aaron Taylor)

// Include main modules
var express = require('express');
var path = require('path');
var http = require('http');
var sqlite = require('sqlite3').verbose();
var jade = require('jade');
var bodyParser = require('body-parser');
var sha1 = require('node-sha1');
var colors = require('colors');

// A little more setup
var app = express();
var server = http.Server(app);
var io = require('socket.io').listen(server, {log: true});
var db = new sqlite.Database(path.join(process.env.PWD, 'data.db'));

// Set variables used to store possibly non-constant information
var uploadPassword = 'db25f2fc14cd2d2b1e7af307241f548fb03c312a';
var languages = ['javascript', 'css', 'python', 'markup', 'php', 'coffescript', 'bash', 'c', 'cpp', 'ruby', 'swift', 'objectivec', 'haskell'];
var jquery = "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js";

// Setup setting for express
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine(".html", jade.__express);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

// Setup pretty log
var log = {
	info: function(msg) { console.log("[ " + "info".cyan + " ] " + msg); },
	ok: function(msg) { console.log("[ " + " ok ".green + " ] " + msg); },
	err: function(msg) { console.log("[ " + "err!".red + " ] " + msg); },
	warn: function(msg) { console.log("[ " + "warn".yellow + " ] " + msg); },
	_: function(msg) { console.log("[ " + " .. ".blue + " ] " + msg); },
	indent: function(msg) { console.log("       " + msg); },
	plain: function(msg) { console.log(msg); }
};

// Check if local argument is supplied
for (arg in process.argv) {
	if (process.argv[arg] == 'local') {
		jquery = "/js/jquery.js";
		log.info("local mode");
	}
}

function randomLink() {
	// Used to generate random link for code

	var link = "";
	var possible = "abcdefghijklmnopqrstuvwxyz1234567890";

	for (var i = 0; i < 8; i++) {
		link += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return link;
}

// Routing
app.get('/', function(req, res) {
	res.render('index', {jquery: jquery});
});
app.get('/recent', function(req, res) {
	res.render('recent', {jquery: jquery});
});

app.get('/:link', function(req, res) {

	var subdomain = req.headers.host.split(":")[0].split(".")[0]; // Find subdomain of request

	var link = req.params.link;
	var queried = false;
	var code = "";
	var lang = -1;

	db.each("SELECT code,lang FROM links WHERE link=?", link, function(err, row) {
		code = row.code;
		lang = parseInt(row.lang);
		queried = true;
	}, function() { 
		// After SELECT query has returned

		if (queried) { // If the query actually occured
			if (subdomain == "raw") { // If the user is requesting the "raw" subdomain
				res.writeHead(200, {
					'Content-Length': code.length,
					'Content-Type': 'text/plain'
				});
				res.write(code);
				res.end();
			}
			else {
				res.render('code', {code: code, lang: lang, link: link, jquery: jquery});
			}
		}
		else {
			res.render('404', {link: link, jquery: jquery});
		}
	});
	
});

io.sockets.on('connection', function(socket) {
	// When a user connects

	socket.on('codeSubmit', function(data) {
		// When the user submits their code

		// Retreive values of the code and password feid
		var code = data.code;
		var lang = data.lang;

		// Remove the extra newline characters from code
		while (code.substr(-1) == "\n") {
			code = code.substr(0,-1)
		}

		if (sha1(data.password) == uploadPassword && lang+1 <= languages.length && lang+1 >= 1) { // Ensure password is correct and language exsists

			var exists = false;
			db.each("SELECT name FROM sqlite_master WHERE type='table' AND name='links'", function(err, row) {
				if (row.name == "links") {
					exists = true;
				}
			}, function() {
				db.run("CREATE TABLE IF NOT EXISTS links (link varchar(8), lang int, code varchar)", function() {
					
					link = randomLink(); // Generate a random link for the code to be stored at

					db.run("INSERT INTO links VALUES (?, ?, ?)", link, lang, code, function() {
						// Store code and alert user of link

						socket.emit("redirect", link); 
						log.info("new entry created at: "+link);
					});
				});
			});
		}
		else {
			// If the password is incorrect

			socket.emit("password", false);
			log.warn("incorrect password");
		}
	});
	socket.on('password', function(data) {
		// On password submission (only for /recent)

		if (sha1(data) == uploadPassword) {
			extentions = [];
			langs = [];
			db.each("SELECT link,lang FROM links", function(err, row) {
				extentions.push(row.link);
				langs.push(row.lang);
			}, function() {
				if (extentions !== []) {
					socket.emit('recent', [extentions, langs]);
				}
				else {
					socket.emit('recent', false);
				}
			});
		}
		else {
			socket.emit('password', false);
			log.warn("incorrect password");
		}
	});
});

// Start express server
server.listen(app.get('port'), function() {
	log.info('listening on port ' + app.get('port'));
});
