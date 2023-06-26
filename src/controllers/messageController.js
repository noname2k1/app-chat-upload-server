const messageModel = require('../models/messageModel');
const roomModel = require('../models/roomModel');
const messageController = {
    index: async (req, res) => {
        try {
            const messages = await messageModel.find({});
            return res.status(200).json({
                status: 'success',
                message: 'get all messages successfully',
                messages,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    //[GET] '/api/chat/message?id=&skip='
    show: async (req, res) => {
        const roomid = req.query.id;
        const limit = req.query.limit || 20;
        const page = req.query.page || 0;
        const skip = page * limit;
        try {
            const messages = await messageModel
                .find({ roomid })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('sender')
                .populate('roomid')
                .populate('reacter')
                .populate({
                    path: 'replymessageid',
                    populate: {
                        path: 'sender',
                    },
                });
            if (!messages) {
                return res
                    .status(404)
                    .json({ status: 'failed', message: 'roomid not found' });
            }
            const countMessages = await messageModel.countDocuments({ roomid });
            return res.status(200).json({
                status: 'success',
                message: 'get all messages successfully',
                messages,
                countMessages,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    //[GET] '/api/chat/message/search/:roomid/:msgid'
    searchByMsgId: async (req, res) => {
        const roomid = req.params.roomid;
        const msgid = req.params.msgid;
        try {
            const message = await messageModel.findOne({
                _id: msgid,
                roomid: roomid,
            });
            if (!message) {
                return res.status(404).json({
                    status: 'failed',
                    message: 'massage id not found',
                });
            }
            const messages = await messageModel
                .find({
                    createdAt: { $gte: message.createdAt },
                    roomid: roomid,
                })
                .populate('sender')
                .populate('roomid')
                .populate('reacter')
                .populate({
                    path: 'replymessageid',
                    populate: {
                        path: 'sender',
                    },
                });
            const preMessages = await messageModel
                .find({
                    createdAt: { $lt: message.createdAt },
                    roomid: roomid,
                })
                .sort({ createdAt: -1 })
                .populate('sender')
                .populate('roomid')
                .populate('reacter')
                .populate({
                    path: 'replymessageid',
                    populate: {
                        path: 'sender',
                    },
                })
                .limit(10);
            preMessages.reverse();
            return res.status(200).json({
                status: 'success',
                message: 'get all messages successfully',
                messages,
                messages: [...preMessages, ...messages],
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    //[GET] '/api/chat/message/search?id=&word='
    searchByWord: async (req, res) => {
        const roomid = req.query.id;
        const word = req.query.word;
        try {
            const messages = await messageModel
                .find({
                    roomid: roomid,
                    message: new RegExp(`\\b(${word})\\b`, 'i'),
                })
                .populate('sender')
                .populate('roomid')
                .populate('reacter')
                .populate({
                    path: 'replymessageid',
                    populate: {
                        path: 'sender',
                    },
                });
            return res.status(200).json({
                status: 'success',
                message: 'get all matched messages successfully',
                messages,
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    //[POST] '/api/chat/message'
    new: async (req, res) => {
        const { roomid, message } = req.body;
        const reply = req.body.reply;
        try {
            if (!roomid) {
                return res
                    .status(403)
                    .json({ status: 'failed', message: 'Roomid is required' });
            }
            const room = await roomModel.findOne({ roomid });
            if (!room) {
                return res
                    .status(403)
                    .json({ status: 'failed', message: 'Room not found' });
            }
            if (!reply) {
                const newMessage = await messageModel.create({
                    roomid,
                    sender: req.userid,
                    message,
                });
                return res.status(200).json({
                    status: 'success',
                    message: 'New Message created successfully',
                });
            }
            const newReplyMessage = await messageModel.create({
                roomid,
                sender: req.userid,
                message,
                reply: true,
                replymessageid: req.body.replymessageid,
            });
            return res.status(200).json({
                status: 'success',
                message: 'New Reply Message created successfully',
            });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    // [GET] '/api/chat/message/attachment/:roomid'
    filter: async (req, res) => {
        const { roomid } = req.params;
        try {
            const messagesHaveAttachment = await messageModel.find({
                roomid,
                attachmentsLink: { $exists: true },
            });
            return res
                .status(200)
                .json({ status: 'success', messagesHaveAttachment });
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal Server Error' });
        }
    },
    update: async (req, res) => {
        try {
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
    delete: async (req, res) => {
        try {
        } catch (error) {
            console.log(error);
            return res
                .status(500)
                .json({ status: 'failed', message: 'Internal server error' });
        }
    },
};
module.exports = messageController;
