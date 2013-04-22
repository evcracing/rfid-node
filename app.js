var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
var SerialPort = require("serialport").SerialPort;

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('fj2s4'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

/* Setup Serial Port */
var serialPort = new SerialPort("/dev/tty.usbserial-A100RZK7", {
    baudrate: 115200
});

/* Serial Port Handler */
serialPort.on("open", function () {
    console.log('Serial Port Opened.');
    serialPort.on('data', function(data) {
    if (data[0]==0x2E) {
        io.sockets.emit('heatbeat', true);
    }
	if (data[0]==0x8F) {
		io.sockets.emit('tag-id', data.slice(1,4).toString());
	}
  });  
  serialPort.write("B\n");
});  

/*Socket.io Handlers*/
io.sockets.on('connection', function (socket) {
    console.log("User Connected.");
});
io.set('log level', 1); // reduce logging
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});