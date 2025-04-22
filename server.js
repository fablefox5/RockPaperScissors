const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const games = {}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user has connected');
    socket.on('player join', (id, name) => {
        socket.broadcast.emit('player join', id, name);
    });
    socket.on('option selected', (id, option, gameCode, enemyIndex) => {
        // socket.broadcast.emit('option selected', id, option);
        console.log("at index", games[gameCode]["playerIDs"][enemyIndex]);
        io.to(games[gameCode]["playerIDs"][enemyIndex]).emit('option selected', id, option);
    });
    socket.on('disconnect', () => {
        for (game in Object.values(games)) {
            for(ids in game.playerIds){
                if(ids[0] === socket.id) {
                    io.to(ids[1]).emit('player disconnect');
                }
                else if(id[1] === socket.id) {
                    io.to(id[0]).emit('player disconnect');
                }
            }
        }
        socket.emit('player disconnect');
    })
    socket.on('create game', (gameCode, playerID, playerName) => {
        if(gameCode in games) {
            for(let game in games) {
                console.log(games);
            }
            socket.emit('create game', 'nonunique');
        }
        else {
            let game = {
                playerNames: [playerName],
                playerIDs: [playerID]
            }
            games[gameCode] = game;
            socket.emit('create game','success');
        }
    })
    socket.on('join game', (gameCode, playerID, playerName) => {
        if(gameCode in games) {
            games[gameCode]["playerNames"].push(playerName);
            games[gameCode]["playerIDs"].push(playerID);
            console.log("after joining and adding: ", games);
            socket.emit('join game', 
                gameCode, games[gameCode]["playerIDs"][0], games[gameCode]["playerNames"][0]);
            io.to(games[gameCode]["playerIDs"][0]).emit('join game', 
                gameCode, playerID, playerName);
        }
        else {
            socket.emit('join game', 'nonfound');
        }
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});