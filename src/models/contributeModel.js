const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contributeSchema = new Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        attachments: [{ type: String, ref: 'attachment' }],
        profile: { type: Schema.Types.ObjectId, ref: 'profile' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('contribute', contributeSchema);
