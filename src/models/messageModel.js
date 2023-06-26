const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        roomid: { type: String, required: true, ref: 'room' },
        sender: {
            type: String,
            required: true,
            ref: 'profile',
        },
        message: { type: String, default: '' },
        reacter: [{ type: String, ref: 'profile' }],
        reply: { type: Boolean, default: false },
        replymessageid: {
            type: String,
            ref: 'messsage',
        },
        attachmentsLink: [],
        hide: { type: Boolean, default: false },
        purpose: {
            type: String,
            default: 'message',
            emum: [
                'message',
                'notice-add',
                'notice-new',
                'notice-out',
                'call',
                'system',
            ],
        },
    },
    {
        timestamps: true,
    }
);

const messageModel = new mongoose.model('messsage', messageSchema);
module.exports = messageModel;
