'use strict'

//Topic: Es la parte de los comentarios de los topic del foro..

var express = require ('express');
var CommentController = require('../controller/comment');

var md_auth = require('../middlewares/authenticated');

var router = express.Router();


router.post('/comment/topic/:topicId',md_auth.authenticated, CommentController.add);
router.put('/comment/:commentId',md_auth.authenticated, CommentController.update);
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, CommentController.delete);


module.exports = router;