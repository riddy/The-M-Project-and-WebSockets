//try this one if there are problems to require socket-io or express
require.paths.push('/usr/local/lib/node_modules');

//include socket-io and express (need to be installed first - try npm)
var io = require('socket.io');
var express = require('express');

//create the server
var app = express.createServer()
    , io = io.listen(app);

var nicknames = {};

//specifys the port to listen for messages
app.listen(8080);

io.configure(function () {
    //send own heartbeats
    io.set('heartbeats', false);
    //high timeout
    io.set('heartbeat timeout', 2 * 60 * 1000)
    io.set('close timeout', 3 * 60 * 1000);
});

io.sockets.on('connection', function (socket) {


    socket.on('message', function (msg) {
        socket.broadcast.emit('message', socket.nickname + ': ' + msg);
        socket.emit('message', 'Me: ' + msg);

    });


    socket.on('nickname', function (nick, fn) {
        if (nicknames[nick]) {
            //inform nick already exist
        } else {
            nicknames[nick] = socket.nickname = nick;
            socket.broadcast.emit('newmember', nick + ' connected');
        }
    });

    socket.on('disconnect', function () {
        if (!socket.nickname) return;

        delete nicknames[socket.nickname];
        socket.broadcast.emit('membergone', socket.nickname + ' disconnected');
    });

    //echo the received value to show connection-health
    socket.on('p', function(val) {
        socket.emit('p', val);
    });

});
