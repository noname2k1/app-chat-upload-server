const route = require('express').Router();
const roomController = require('../controllers/roomController');
const messageController = require('../controllers/messageController');
//'api/chat/room/'
route.post('/room', roomController.new);
route.patch('/room/change-background', roomController.changeBackground);
route.patch('/room', roomController.update);
route.get('/room/search-by-name', roomController.searchByName);
route.get('/room/search', roomController.search);
route.get('/room/me', roomController.me);
route.get('/room/:id', roomController.show);
route.get('/room', roomController.index);

//'api/chat/message/'
route.get('/message', messageController.show);
route.get('/message', messageController.index);
route.get('/message/attachment/:roomid', messageController.filter);
route.get('/message/search/:roomid/:msgid', messageController.searchByMsgId);
route.get('/message/search', messageController.searchByWord);
// route.get('/message/', messageController);

module.exports = route;
