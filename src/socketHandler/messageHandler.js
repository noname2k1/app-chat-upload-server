//message
const roomModel = require('../models/roomModel');
const messageModel = require('../models/messageModel');
const profileModel = require('../models/profileModel');
module.exports = (io, socket) => {
    socket.on('typing', (roomid, profile) => {
        socket.broadcast.to(roomid).emit('typing', profile, roomid);
    });
    socket.on('stop-typing', (roomid) => {
        socket.broadcast.to(roomid).emit('stop-typing', socket.id);
    });
    socket.on('send-message', async (data) => {
        // console.log(roomid, senderid, message, isReply, replyMsgid);
        const sender = await profileModel.findById(data.sender);
        if (!sender) {
            return;
        }
        const room = await roomModel.findById(data.roomid);
        if (!room) {
            return;
        }
        if (room.blocked) {
            return;
        }
        if (!data.reply) {
            const newMessage = await messageModel.create({
                roomid: data.roomid,
                sender: sender._id,
                message: data.message,
                attachmentsLink: data.attachmentsLink,
            });
            const updateRoom = await roomModel.findOneAndUpdate(
                { _id: data.roomid },
                {
                    lastMessage:
                        newMessage.message !== ''
                            ? newMessage.message
                            : 'has send attachments',
                    lastMessageSenderName: sender.name,
                    viewer: [],
                    deleted: [],
                },
                { new: true }
            );
            if (updateRoom) {
                io.in(data.roomid).emit('load-list-of-rooms');
            }
            newMessage.sender = sender;
            return io.in(data.roomid).emit('new-message', newMessage);
        }
        const replyMessage = await messageModel.findById(data.replymessageid);
        if (!replyMessage) {
            return;
        }
        const newMessage = await messageModel.create({
            roomid: data.roomid,
            sender: sender._id,
            message: data.message,
            reply: true,
            replymessageid: data.replymessageid,
        });
        const updateRoom = await roomModel.findOneAndUpdate(
            { _id: data.roomid },
            {
                lastMessage:
                    newMessage.message !== ''
                        ? newMessage.message
                        : 'has send attachments',
                lastMessageSenderName: sender.name,
                viewer: [],
                deleted: [],
            },
            { new: true }
        );
        if (updateRoom) {
            io.in(data.roomid).emit('load-list-of-rooms');
        }
        newMessage.sender = sender;
        newMessage.replymessageid = replyMessage;
        return io.in(data.roomid).emit('new-message', newMessage);
    });
    socket.on('like', ({ roomid, profileid, messageid }) => {
        messageModel
            .findByIdAndUpdate(
                messageid,
                {
                    $addToSet: { reacter: profileid },
                },
                { new: true }
            )
            .populate('sender')
            .then((message) => {
                io.in(roomid).emit('like', { message, profileid });
            })
            .catch((err) => {
                console.log(err);
            });
    });
    socket.on('dislike', ({ roomid, profileid, messageid }) => {
        messageModel
            .findByIdAndUpdate(
                messageid,
                {
                    $pull: { reacter: profileid },
                },
                { new: true }
            )
            .populate('sender')
            .then((message) => {
                io.in(roomid).emit('dislike', { message, profileid });
            })
            .catch((err) => {
                console.log(err);
            });
    });
    socket.on('show-message', ({ roomid, messageid }) => {
        messageModel
            .findByIdAndUpdate(
                messageid,
                {
                    hide: false,
                },
                { new: true }
            )
            .populate('sender')
            .then((message) => {
                if (message) {
                    io.in(roomid).emit('show-message', message);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    });
    socket.on('hide-message', ({ roomid, messageid }) => {
        messageModel
            .findByIdAndUpdate(
                messageid,
                {
                    hide: true,
                },
                { new: true }
            )
            .populate('sender')
            .then((message) => {
                if (message) {
                    io.in(roomid).emit('hide-message', message);
                }
            })

            .catch((err) => {
                console.log(err);
            });
    });
};
