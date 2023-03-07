const mongoose = require('mongoose');
const connect = () => {
    // Connect to the database
    mongoose.set('strictQuery', false);
    mongoose
        .connect(
            process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fun-chat'
        )
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => console.log('Error connecting to MongoDB', err));
};
module.exports = connect;
