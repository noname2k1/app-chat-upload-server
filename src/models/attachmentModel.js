const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attachmentSchema = new Schema(
    {
        filename: { type: String, required: true },
        extension: { type: String, required: true },
        content: { type: String },
        url: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('attachment', attachmentSchema);
