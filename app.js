'use strict'
//Importaciones
var express = require('express');
var bodyParser = require('body-parser');

//Ejecutar express
var app = express();

//Cargar archivos de rutas
var user_routes = require('./router/user');
var topic_routes = require('./router/topic');
var comment_routes = require('./router/comment');

//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//Reescribir rutas
app.use('/api', user_routes);
app.use('/api', topic_routes);
app.use('/api', comment_routes);

//Exportar modulo
module.exports = app;