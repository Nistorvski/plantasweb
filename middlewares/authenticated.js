'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave-secreta-para-generar-el-token9999';

exports.authenticated = function (req, res, next){
    console.log('ESTAS PASANDO POR EL MIDDLEWARES..¡!');

    //Comprobar si llega autorización
        if(!req.headers.authorization){
            return res.status(403).send({
                message: 'LA petición no tiene la cabecera de authorization'
            });            
        }
    //Limiar el token y quitar comillas
        var token = req.headers.authorization.replace(/['"]+/g, '');

        try{
             //Decodificar token
            var payload = jwt.decode(token, secret);
            //COmprobar si el token ha expirado
            if(payload.exp <= moment().unix()){
                return res.status(404).send({
                    message: 'EL token ha expirado'
                });            
            }

        }catch(ex){
            return res.status(404).send({
                message: 'EL token no es válido..'
            });  
        }

    //Afjuntar usuario identificado a request
        req.user = payload;
    //Pasar a la acción (al next..)
    next();
};