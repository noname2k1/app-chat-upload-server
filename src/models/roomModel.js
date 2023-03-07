const mongoose = require('mongoose');
const roomSchema = new mongoose.Schema(
    {
        name: { type: String },
        host: { type: String, ref: 'profile' },
        cohost: { type: String, ref: 'profile' },
        member: [{ type: String, required: true, ref: 'profile' }],
        mode: { type: String, enum: ['room', 'private'] },
        avatar: {
            type: String,
            default:
                'https://res.cloudinary.com/ninhnam/image/upload/v1660324573/default_avatar/default-room-avatar_mrfkhm.jpg',
        },
        lastMessage: { type: String },
        lastMessageSenderName: { type: String },
        request: [{ type: String, ref: 'profile' }],
        public: { type: Boolean, default: true },
        viewer: [{ type: String, ref: 'profile' }],
        backgroundColor: { type: String, default: 'default' },
        blocked: { type: String, ref: 'profile' },
        muted: [{ type: String, ref: 'profile' }],
        deleted: [{ type: String, ref: 'profile' }],
    },
    {
        timestamps: true,
    }
);

const roomModel = new mongoose.model('room', roomSchema);
module.exports = roomModel;
