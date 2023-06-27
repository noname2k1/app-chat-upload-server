//room
const roomModel = require('../models/roomModel');
const profileModel = require('../models/profileModel');
const messageModel = require('../models/messageModel');
module.exports = (io, socket) => {
    socket.on('join', (roomidArray) => {
        console.log(`${socket.id} joined ${roomidArray}`);
        socket.join(roomidArray);
    });
    socket.on('create-room', (roomid) => {
        socket.join(roomid);
        io.to(socket.id).emit('create-room');
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
                return socket.emit('load-list-of-rooms', profileid);
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
    socket.on('add-new-member', async ({ senderid, receiverid, roomid }) => {
        // add a message to the room
        const newNoticeMessage = await messageModel.create({
            purpose: 'notice-add',
            roomid,
            sender: senderid,
            reacter: [receiverid],
        });
        const message = await messageModel
            .findOne({
                _id: newNoticeMessage._id,
            })
            .populate('sender')
            .populate('reacter');
        io.emit('add-new-member', { receiverid, room_id: roomid, message });
    });
    socket.on('leave-room', async (roomid, profile) => {
        const room = await roomModel
            .findById(roomid)
            .populate('member')
            .populate('request')
            .populate('blocked')
            .populate('cohost');
        if (room) {
            const newNoticeMessage = await messageModel.create({
                purpose: 'notice-out',
                roomid,
                sender: profile._id,
            });
            const message = await messageModel
                .findOne({
                    _id: newNoticeMessage._id,
                })
                .populate('sender');
            socket.leave(roomid);
            io.in(roomid).emit('notification-leave-room', room, profile.name);
            io.in(roomid).emit('member-out-room', { roomid, message });
            if (room.member.length === 0) {
                const deleteRoom = await roomModel.findByIdAndDelete(roomid);
            }
        }
        io.to(socket.id).emit('leave-room', profile._id);
    });
};
