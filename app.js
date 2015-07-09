/**
 * Module dependencies.
 */

var log = console.log;
var debug_flg = 1;

var express = require('express');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
var port = process.env.PORT || 5000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var io = require('socket.io').listen(app);

var chara_counter = 0;
var characters = {};

io.sockets.on('connection', function (socket) { 
	//console.log('connected');
	socket.on('init', function (code, x, y) {

		if (debug_flg) log('--- init start ---');

		var character = {code:code, x:x, y:y, id:chara_counter, socket:socket};
		socket.set('character', character, function () {
			socket.emit('ready', chara_counter);
			socket.broadcast.emit('new character', {code:character.code, x:character.x, y:character.y, id:character.id});		

			for(var chidx in characters){
				var ch = characters[chidx];
				//console.log(ch);
				socket.emit('new character', {code:ch.code, x:ch.x, y:ch.y, id:ch.id}); 
			}
		});
		characters[chara_counter] = character;
		chara_counter++;

		if (debug_flg) log('--- init end ---');
	});
	socket.on('msg send', function (msg) {
		if (debug_flg) log('--- send msg start ---');

		socket.get('character', function (err, ch) {
			if( ch ){
				if (debug_flg) log(' msg push '+msg);
				socket.broadcast.emit('msg push', ch.id, msg);
			}
		});
		if (debug_flg) log(' msg push '+msg);
		if (debug_flg) log('--- send msg end ---');
　
	});
	socket.on('position send', function (x, y) {
		if (debug_flg) log('--- position send start ---');
		socket.get('character', function (err, ch) {
			//console.log("ch is :"+ch);
			if( ch ){
				//console.log("position push :"+ch);
				socket.broadcast.emit('position push', ch.id, x, y);
				characters[ch.id].x = x;
				characters[ch.id].y = y;
			}
		});
		if (debug_flg) log('--- position send  end  ---');
	});
	socket.on('disconnect', function() {
		if (debug_flg) log('--- disconnect start ---');
		//console.log('disconnected');
		socket.get('character', function (err, ch) {
			if( ch ){
				socket.broadcast.emit('delete character', ch.id);
				delete characters[ch.id];
			}
		});
		if (debug_flg) log('--- disconnect end ---');
	});
});
