const route = require('express').Router();
const profileController = require('../controllers/profileController');

route.patch('/', profileController.patch);
route.put('/', profileController.update);
route.get('/me', profileController.me);
route.get('/search', profileController.search);
route.get('/:profileid', profileController.show);
route.get('/', profileController.index);

module.exports = route;
