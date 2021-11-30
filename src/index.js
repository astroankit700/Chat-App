const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words')
const { generateMessages, generateLocationMessages } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketio(server)


const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath)) //app.use => middleware layer ////express.static => specifies the root directory from which to serve static assets

io.on('connection', (socket) => {
    console.log("New Connection Estabilished!!");


    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) return callback(error);

        socket.join(user.room);
        socket.emit('message', generateMessages('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessages("Admin", `${user.username} joined the chat...`));
        callback()
    })

    socket.on('send', (msg, callback) => {
        const filter = new Filter();
        if (filter.isProfane(msg)) return callback('Profanity is not allowed!!');

        const user = getUser(socket.id);

        io.to(user.room).emit('message', generateMessages(user.username, msg));
        callback()

    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessages(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessages('Admin', `${user.username} left the chat...`))
        }
    })


})

server.listen(port, () => {
    console.log("Server is up on port " + port);
})
