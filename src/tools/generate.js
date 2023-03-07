module.exports = generate = {
    requestKey: () => {
        const preString = 'request_key_no_';
        const random = Math.floor(Math.random() * 1000000);
        const now = Date.now();
        return preString + random + now;
    },
};
