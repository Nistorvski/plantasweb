'use strict'

var express = require ('express');
var UserController = require('../controller/user');
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

var router = express.Router();

//Ruta de prueba
router.get('/probando', UserController.probando);

//Rutas de ususarios
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/user/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.getAvatar);
router.get('/users', UserController.getUsers);
router.get('/user/:id', UserController.getUser);





module.exports = router;