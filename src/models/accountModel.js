const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { type: String, required: true, default: 'user' },
        status: {
            type: String,
            required: true,
            enum: ['non-active', 'active'],
            default: 'non-active',
        },
        requestKey: { type: String },
    },
    {
        timestamps: true,
    }
);

const accountModel = new mongoose.model('account', accountSchema);
module.exports = accountModel;
