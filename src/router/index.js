const authRoute = require('./authRoute');
const profileRoute = require('./profileRoute');
const chatRoute = require('./chatRoute');
const { isAuthenticated } = require('../middlewares/authMiddleWares');
const authRoutes = (app) => {
    app.use('/api/auth', authRoute);
    app.use('/api/profile', isAuthenticated, profileRoute);
};
const chatRoutes = (app) => {
    app.use('/api/chat', isAuthenticated, chatRoute);
};
module.exports = { authRoutes, chatRoutes };
