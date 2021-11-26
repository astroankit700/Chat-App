const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words')

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath)) //app.use => middleware layer ////express.static => specifies the root directory from which to serve static assets

io.on('connection', (socket) => {
    console.log("New Connection Estabilished!!");

    socket.on('welcome', (userName) => {
        socket.broadcast.emit('welcomeMessage', `${userName} joined the chat...`)
    })

    socket.on('send', (msg, callback) => {
        const filter = new Filter();
        if (filter.isProfane(msg.message)) return callback('Profanity is not allowed!!');

        io.emit('received', msg);
        callback()

    })

    socket.on('sendLocation', ({ userName, location }, callback) => {
        io.emit('locationMessage', { userName, url: `https://google.com/maps?q=${location.latitude},${location.longitude}` })
        callback();
    })

    socket.on('disconnect', () => {
        io.emit('left')
    })


})

server.listen(port, () => {
    console.log("Server is up on port " + port);
})