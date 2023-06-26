//auth
let onlineUsers = [];
module.exports = (io, socket) => {
    socket.on('online', ({ profileid, avatarlink, name }) => {
        const userData = {
            socketid: socket.id,
            profileid,
            avatar: avatarlink,
            name,
        };
        if (!onlineUsers.some((user) => user.profileid === profileid)) {
            console.log(`${name} is online`);
            // if user is not added before
            onlineUsers.push(userData);
            console.log('new user is here!', onlineUsers);
        }
        // send all active users to new user
        io.emit('online', onlineUsers);
    });
    // register notification
    socket.on('register', (data) => {
        io.to(socket.id).emit('register', data);
    });

    //logout => disconnect
    socket.on('disconnect', () => {
        onlineUsers = onlineUsers.filter((user) => user.socketid !== socket.id);
        console.log('user disconnected', onlineUsers);
        // send all online users to all users
        io.emit('online', onlineUsers);
    });

    socket.on('offline', () => {
        // remove user from active users
        onlineUsers = onlineUsers.filter((user) => user.socketid !== socket.id);
        console.log('user is offline', onlineUsers);
        // send all online users to all users
        io.emit('online', onlineUsers);
    });
};
