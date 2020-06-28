'use strict'

var validator = require('validator');
var fs = require('fs');
var path = require('path');
var jwt = require('../service/jwt');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');


var controller = {

    probando: function (req, res) {
        return res.status(200).send({
            message: 'Soyel metodo de prueba del controllasdor'
        });
    },

    //GUARDAR USUARIO

    save: function (req, res) {
        //Recoger los parametros
        var params = req.body;
        //Validar los datos

        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);

        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar...¡!'
            });
        }

        if (validate_name && validate_surname && validate_email && validate_password) {
            //Crear objeto de usuario
            var user = new User();
            //Asignar valores al objeto
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.rol = 'ROLE_USER';
            user.image = null;

            //Comprobar si el usuario existe
            User.findOne({
                email: user.email
            }, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al comprobar la dublicidad del ususario...'
                    });
                }

                if (!issetUser) {

                    //Si no existe:
                    //cifrar la contraseña
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        //y guardar usuarios
                        user.save((err, userStored) => {
                            if (err) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'Error al guardar el ususario...'
                                });
                            }

                            if (!userStored) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'No hay usuario para guardar...'
                                });
                            }
                            //Devolver respuesta    
                            return res.status(200).send({
                                status: 'succes',
                                message: 'Usuario guardado correctamente..¡!',
                                user: userStored
                            }); //Close save

                        }); //Close bcrypt

                    });

                } else {
                    return res.status(200).send({
                        message: 'El usuario ya existe..'
                    });
                }



            })

        } else {
            return res.status(200).send({
                status: 'error',
                message: 'La validacion erronea..'
            });
        }
    },

    //LOGUEAR USUARIO-> COMRROBAR SI EXISTE LA CUENTA DLE USUARIO Y ENCRIPTAR LOS DATOS (JWT)..

    login: function (req, res) {
        //Recoger los parametros
        var params = req.body;
        //Validar los datos que me llegan
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar...¡!'
            });
        }


        if (!validate_password || !validate_email) {
            return res.status(200).send({
                message: 'El usuario o la contraseña son incorrectos¡!..'
            });
        }

        //Buscar ususarios que coincidan con el email
        User.findOne({
            email: params.email.toLowerCase()
        }, (err, user) => {


            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Usuario no identificado ..'
                });
            }

            if (!user) {
                return res.status(404).send({
                    status: 'error',
                    message: 'El usuario no existe ..'
                });
            }

            //Si lo encuentra:
            //Comprobar la contraseña (coincidencia de emial y password / bcrypt)
            bcrypt.compare(params.password, user.password, (err, check) => {
                //Si es correcto:

                if (check) {
                    //Generar token de jwt y devolverlo 

                    if (params.gettoken) {

                        //Devolver los datos.
                        return res.status(200).send({
                            token: jwt.cerateToken(user)
                        });

                    } else {
                        //Limpiar el objeto antes de devolverlo: 
                        user.password = undefined;

                        //Devolver los datos.
                        return res.status(200).send({
                            status: 'succes',
                            message: 'Usuario encontrado ..',
                            user
                        });
                    }
                } else {
                    return res.status(200).send({
                        message: 'El usuario o la contraseña son incorrectos¡!..'
                    });
                }


            });
        });



    },

    //EDITAR USUARIO..

    update: function (req, res) {
        //Paso 0: Crear el midleware para comprobar el jwt token, y adjuntarlo a la ruta...(hecho..)
        //Recoger los datos del usuario
        var params = req.body;

        //Validar datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_surname = !validator.isEmpty(params.surname);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar...¡!'
            });
        }

        //Eliminar propiedades inecesarias
        delete params.password;


        var userId = req.user.sub;

        //Comprobar si el email es unico /existe

        if (req.user.email != params.email) {
            User.findOne({
                email: params.email.toLowerCase()
            }, (err, user) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Usuario no identificado ..'
                    });
                }

                if (user && user.email == params.email) {
                    return res.status(200).send({
                        message: 'El email ya existe y no puede ser modificado... ¡! '
                    });
                } else {
                    //Buscar y actualizar el documento / FindOneAndUpdate
                    User.findOneAndUpdate({
                        _id: userId
                    }, params, {
                        new: true
                    }, (err, userUpdated) => {

                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar los datos..¡!'
                            });

                        }

                        if (!userUpdated) {
                            return res.status(404).send({
                                status: 'error',
                                message: 'No se han actualizado los datos..¡!'
                            });
                        }

                        //Devolver respuesta
                        return res.status(200).send({
                            status: 'success',
                            user: userUpdated
                        });

                    });
                }
            });
        } else {



            //Buscar y actualizar el documento / FindOneAndUpdate
            User.findOneAndUpdate({
                _id: userId
            }, params, {
                new: true
            }, (err, userUpdated) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar los datos..¡!'
                    });

                }

                if (!userUpdated) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se han actualizado los datos..¡!'
                    });
                }

                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });

            });
        }

    },

    uploadAvatar: function (req, res) {
        //Configurar el modulo multiparty (middleware(md)) (hecho..)

        //Recoger el fichero de la peticion
        var file_name = 'Archivo no subido';

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });

        }

        //Conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        //Coprobar extension (solo imagenes), si no es valido borrar el fichero

        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'success',
                    message: 'La extensión no es válida..¡!'
                });
            });

        } else {
            //Sacar el id del usuario identificado
            var userId = req.user.sub;
            //Buscar y actualizar documento de la bd
            User.findOneAndUpdate({
                _id: userId
            }, {
                image: file_name
            }, {
                new: true
            }, (err, userUpdated) => {

                if (err || !userUpdated) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar los datos'
                    });
                }

                //Devolver respuesta
                return res.status(200).send({
                    status: 'success',
                    message: 'Imagen subida',
                    user: userUpdated
                });

            });

        }


    },

    getAvatar: function (req, res) {
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/' + fileName;

        fs.exists(pathFile, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(pathFile));
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe'
                });
            }
        });
    },


    getUsers: function (req, res) {
        User.find().exec((err, users) => {

            if (err || !users) {
                return res.status(500).send({
                    status: 'error...¡!',
                    message: 'Error al encontrar los usuarios..¡!'
                });
            }

            //Devolver respuesta
            return res.status(200).send({
                status: 'success',
                users
            });


        });
    },


    getUser: function (req, res) {
        var userId = req.params.id;
        User.findById(userId).exec((err, user) => {

            if (err || !user) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al encontrar el usuario..¡!'
                });
            }

            //Devolver respuesta
            return res.status(200).send({
                status: 'success',
                user
            });


        });
    }

};

module.exports = controller;