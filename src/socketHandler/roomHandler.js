//room
const roomModel = require('../models/roomModel');
const profileModel = require('../models/profileModel');
module.exports = (io, socket, usersAreOnline) => {
    socket.on('join', (roomidArray) => {
        const user = usersAreOnline.find((user) => user.socketid === socket.id);
        if (user) console.log(`${user.name} joined ${roomidArray}`);
        socket.join(roomidArray);
    });
    socket.on('load-room', async (myProfileid) => {
        const rooms = await roomModel
            .find({ member: myProfileid })
            .populate('member')
            .sort({ updatedAt: -1 });
        return socket.emit('load-room', rooms);
    });
    socket.on('update-room', async (room) => {
        const roomAfterUpdate = await roomModel
            .findById(room._id)
            .populate('member')
            .populate('request')
            .populate({
                path: 'blocked',
                match: { _id: { $exists: true } },
            });
        io.to(room._id).emit('update-room', roomAfterUpdate);
    });
    socket.on('view', async (roomid, profileid) => {
        const room = await roomModel.findById(roomid);
        console.log('view');
        if (room) {
            const updateViewer = await roomModel.findOneAndUpdate(
                {
                    _id: roomid,
                },
                { $push: { viewer: profileid } },
                { new: true }
            );
            if (updateViewer) {
                return socket.emit('load-list-of-rooms');
            }
        }
    });
    socket.on('request', async (roomid) => {
        const room = await roomModel.findById(roomid).populate('request');
        if (room) io.to(roomid).emit('request-success', room);
    });
    socket.on('accept-request', async (roomid, profileid) => {
        const profile = await profileModel.findById(profileid);
        const room = await roomModel.findById(roomid);
        if (profile) {
            io.in(roomid).emit('notification-new-member', roomid, profile.name);
            io.emit('update-my-rooms', profile._id);
            io.emit('notification-join-room-success', profile._id, room.name);
        }
    });
    socket.on('decline-request', async (roomid, profileid) => {
        const room = await roomModel.findById(roomid);
        if (room) {
            io.emit('notification-decline-request', room.name, profileid);
        }
    });
    socket.on('leave-room', async (roomid, profile, socketid) => {
        const room = await roomModel.findById(roomid);
        if (room) {
            socket.leave(roomid);
            io.in(roomid).emit(
                'notification-leave-room',
                room.name,
                profile.name
            );
        }
        io.to(socketid).emit('load-list-of-rooms');
    });
};
