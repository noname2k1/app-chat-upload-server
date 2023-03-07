const route = require('express').Router();
const authController = require('../controllers/authController');
const {
    isAuthenticated,
    changePassword,
} = require('../middlewares/authMiddleWares');
route.post('/login', authController.login);
route.post('/register', authController.register);
route.patch('/change-password', isAuthenticated, changePassword);
route.patch('/logout', isAuthenticated, authController.logout);
route.get('/me', isAuthenticated, authController.me);
route.get('/', isAuthenticated, authController.index);

module.exports = route;
