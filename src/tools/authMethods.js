const jwt = require('jsonwebtoken');
const authMethods = {
    generatorToken: (data) => {
        const token = jwt.sign(data, process.env.JWT_SECRET_TOKEN);
        return token;
    },
    generatorRefreshToken: (data) => {
        const token = jwt.sign(data, process.env.JWT_SECRET_REFRESH_TOKEN);
        return token;
    },
};
module.exports = authMethods;
