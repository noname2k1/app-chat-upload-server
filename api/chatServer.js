const express = require('express');
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const connect = require('../src/tools/connectToMongo');
const server = http.createServer(app);
const { chatRoutes } = require('../src/router/index');
require('dotenv').config();
app.use(cors());
connect();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
});
//structure socket io
const authHandler = require('../src/socketHandler/authHandler');
const roomHandler = require('../src/socketHandler/roomHandler');
const messageHandler = require('../src/socketHandler/messageHandler');
const callHandler = require('../src/socketHandler/callHandler');
const onConnection = (socket) => {
    authHandler(io, socket);
    roomHandler(io, socket);
    messageHandler(io, socket);
    callHandler(io, socket);
};
io.on('connection', onConnection);

chatRoutes(app);

// 'server' instead of 'app'
const PORT = process.env.CHAT_PORT || 5000;
server.listen(PORT, () =>
    console.log(`chat-server is running on port ${PORT}`)
);

module.exports = app;
