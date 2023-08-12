const authRoute = require('./authRoute');
const profileRoute = require('./profileRoute');
const chatRoute = require('./chatRoute');
const { isAuthenticated } = require('../middlewares/authMiddleWares');
const prefix = '/api';
const authRoutes = (app) => {
    app.use(`${prefix}/auth`, authRoute);
    app.use(`${prefix}/profile`, isAuthenticated, profileRoute);
};
const chatRoutes = (app) => {
    app.use(`${prefix}/chat`, isAuthenticated, chatRoute);
};
const welComeRoutes = (app) => {
    app.get('/', (req, res) => res.status(200).json('Welcome to Chat API'));
};
module.exports = { authRoutes, chatRoutes, welComeRoutes };
