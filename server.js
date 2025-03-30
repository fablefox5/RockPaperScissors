const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user has connected');
    socket.on('player join', (id, name) => {
        socket.broadcast.emit('player join', id, name);
    });
    socket.on('option selected', (id, option) => {
        // io.emit('option selected', option);
        socket.broadcast.emit('option selected', id, option);
        // console.log("option sel: " + option);
    });
    socket.on('disconnect', () => {
        socket.emit('player disconnect');
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});