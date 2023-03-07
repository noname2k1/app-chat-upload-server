const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
    {
        userid: {
            type: mongoose.Types.ObjectId,
            required: true,
            unique: true,
            ref: 'account',
        },
        name: { type: String },
        dateofbirth: { type: Date },
        gender: { type: String, enum: ['male', 'female'], default: 'male' },
        address: { type: String },
        phone: { type: String },
        avatarlink: {
            type: String,
            default:
                'https://res.cloudinary.com/ninhnam/image/upload/v1657259293/default_avatar/male_avatar_t0yrqe.png',
        },
        blocks: [{ type: String, ref: 'profile' }],
    },
    {
        timestamps: true,
    }
);

const profileModel = new mongoose.model('profile', profileSchema);
module.exports = profileModel;
