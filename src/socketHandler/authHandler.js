//auth
module.exports = (io, socket, usersAreOnline) => {
    socket.on('login', ({ profileid, avatarlink, name }) => {
        const userData = {
            socketid: socket.id,
            profileid,
            avatar: avatarlink,
            name,
        };
        // //delete user if they is already online
        console.log(`${name} is online`);
        const exists = usersAreOnline.find(
            (user) => user.profileid === profileid
        );
        if (exists) {
            usersAreOnline.splice(usersAreOnline.indexOf(exists), 1);
        }
        usersAreOnline.push(userData);
        io.emit('online', usersAreOnline);
    });
    //logout => disconnect
    socket.on('disconnect', () => {
        const user = usersAreOnline.find((user) => user.socketid === socket.id);
        if (user) {
            console.log(`${user.name} is offline`);
        }
        usersAreOnline = usersAreOnline.splice(user, 1);
        io.emit('online', usersAreOnline);
    });
};
