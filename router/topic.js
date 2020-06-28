'use strict'

//Topic: Es la parte de los temas del foro..

var express = require ('express');
var TopicController = require('../controller/topic');
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({ uploadDir: './uploads'});

var router = express.Router();

//Ruta de prueba
router.get('/test', TopicController.test);


router.post('/topic',md_auth.authenticated, TopicController.save);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/user-topics/:user', TopicController.getTopicsByUser);
router.get('/topic/:id', TopicController.getTopic);
router.put('/topic/:id',md_auth.authenticated, TopicController.update);
router.delete('/topic/:id', md_auth.authenticated, TopicController.deleteTopic);
router.post('/upload-imagen/:id', multipartMiddleware, TopicController.uploadImage);
router.get('/get-imagen/:imagen', TopicController.getImagenFile);
router.get('/search/:search', TopicController.search);


module.exports = router;