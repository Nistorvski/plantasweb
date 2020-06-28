'use strict'
var mongoose = require('mongoose');
var app = require('./app');
var port = 7777;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node')
    .then(()=>{
        console.log("Conexión a la base de datos establecida con exito..¡!");

        //Crear el servidor
        app.listen(port, ()=>{
            console.log("EL servidor corriendo en localhost: 7777...¡!");
        })

    }).catch(error => {
        console.log(error);
    });