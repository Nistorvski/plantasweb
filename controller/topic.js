'use strict'

var validator = require('validator');
var Topic = require('../models/topic');
var fs = require('fs');
var path = require('path');

var controller = {


    test: function (req, res) {
        return res.status(200).send({
            message: 'Método de prueba de topic.js'
        });
    },

    save: function (req, res) {
        //Recoger parametros por post
        var params = req.body;

        //Validar los datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);


        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_content && validate_title) {
            //Crear objeto a guardar
            var topic = new Topic();

            //Asignar valores
            topic.title = params.title;
            topic.content = params.content;
            topic.category = params.category;
            topic.user = req.user.sub;

            //Guardar el topic
            topic.save((err, topicStored)=>{

                if(err || !topicStored){
                    return res.status(500).send({
                        message: 'Los datos no se han podido guardar..¡!'
                    });                   
                }


                //Devolver una respuesta
            return res.status(200).send({
                status: 'success',
                message: 'Topic guardado..¡!',
                topic: topicStored
            });

            });

            
        } else {
            return res.status(200).send({
                message: 'Los datos no son validos..¡!'
            });
        }
    },


    getTopics: function(req, res){

            //Cargar la libreria de paginación de la clase (hecho- en el modleo de topic);

            //Recoger la pagina actual
            if(!req.params.page  || req.params.page == 0  || req.params.page == "0" || req.params.page == null || req.params.page == undefined){
                var page = 1 ;
            }else{
                var page = parseInt(req.params.page); 
            }
            //indicar las opciones de paginacion
            var options = {
                sort: { date: -1 },
                populate: 'user',
               // populate:'comments.user',
                limit: 105, 
                page: page
            };

            //Find paginado
            Topic.paginate({}, options, (err, topics)=>{

            //Devolver resultado ( total de topics y total de paginas)

            if(err){
                return res.status(500).send({
                    message: 'Los topics no se han podido encontrar..¡!'
                });                   
            }
            if(!topics){
                return res.status(404).send({
                    message: 'No hay topicos..¡!'
                });          
            }

            return res.status(200).send({
                message: 'Lista de topicos..¡!',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages,
                page: page
              
            });
        })

    },

    getTopicsByUser: function(req, res){
        //Conseguir el id del ususario
        var userId = req.params.user;

        //Find con una condicion de usuario
        Topic.find({user: userId}).sort([['date', 'descending']]).exec((err, topics)=>{


            if(err || !topics || topics.length <= 0){
                return res.status(500).send({
                    message: 'No existe este usuario..¡!'
                });                   
            }

            //Devolver resultado

        return res.status(200).send({
            status: 'success',
            topics

        });
     });
        
    },

    getTopic:function(req, res){
        //Sacar el id del topic de la url
        var topicId = req.params.id;
        //Find por el id del topic
        Topic.findById( topicId ).populate('user').populate('comments.user').exec((err, topic)=>{


            if(err || !topic || topic.length <= 0){
                return res.status(500).send({
                    message: 'No existe este topico..¡!'
                });                   
            }

             //Devolver resultado
        return res.status(200).send({
            status: 'success',
            topic

        }); 

        });
                         
    },

    update: function(req, res){
        //Recoger el id del topic de la url
        var topicId = req.params.id;
        //Recoger los datos que llegan desde post
        var params = req.body;
        //Validar datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            var validate_category = !validator.isEmpty(params.category);
         


        } catch (err) {
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }
        if (validate_content && validate_title && validate_category){

        //Montar un json con los datos modificables(que datos permito que se puedan modificar)
        var update = {
            title: params.title,
            content: params.content,
            category: params.category,
            
        };

        //Find and update del topic por id y por id de usuario (hay que ser dueño para poder modificar ese toopic)

        Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new: true}, (err, topicUpdate)=>{

            if(err){
                return res.status(500).send({
                    message: 'Error al editar los datos..¡!'
                });
            }

            if(!topicUpdate){
                return res.status(404).send({
                    message: 'No existe el topico para modificarlo..¡!'
                });
            }

                //Devolver respuesta
                return res.status(200).send({
                    status: 'succes',
                    topic: topicUpdate
                });
        });


        }else{
            return res.status(500).send({
                message: 'La validacion de datos no es correta..¡!',
            });
        }

        },

       deleteTopic:function(req, res){
           //REcoger el id del topic de la url
           var topicId= req.params.id;

           //Find an delete por topicId y por userId
        Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, deleteTopic)=>{


            if(err){
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error al borar los datos..¡!'
                });
            }

            if(!deleteTopic){
                return res.status(404).send({
                    status: 'Error',
                    message: 'No existe el topico para borrarlo..¡!'
                });
            }

           //Devolver respuesta

        return res.status(200).send({
            status: 'success',
            topic: deleteTopic
        });


        })

       },

       
       search: function(req, res){
           //Sacar el string a buscar
        var stringSearch = req.params.search;

           //Find or
        Topic.find({ "$or": [
            { "title": { "$regex": stringSearch, "$options": "i" }},
            { "content": { "$regex": stringSearch, "$options": "i" }},
            { "category": { "$regex": stringSearch, "$options": "i" }},
        ]}).populate('user').sort([['date', 'descending']]).exec((err, topics)=>{


            if(err){
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error en la petición..¡!'
                });
            }

            if(!topics){
                return res.status(404).send({
                    status: 'Error',
                    message: 'No hay temas disponibles..¡!'
                });
            }


           //Devolver resultador
        return res.status(200).send({
            status: 'success ¡!',
            topics
        });

        });

       },




uploadImage: function(req, res){
    var topicId = req.params.id;
    var fileName = 'Imagen no subida';

    if(req.files){

        var filePath = req.files.imagen.path;
        var fileSplit = filePath.split('/');
        var fileName = fileSplit[1];
        var extSplit = fileName.split('\.');
        var fileExt = extSplit[1];

        if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif'){

        Topic.findByIdAndUpdate(topicId, {imagen: fileName}, (err, topicUpdate)=>{

            if(err){
                return res.status(500).send({
                    message:"Error al subir archivo",
                });
            }
    
    
            if(!topicUpdate){
                    return res.status(404).send({
                        message:'No se pudo subir este archivo porque no existe'});
            }
    
            return res.status(200).send({
                topic: topicUpdate
        })

        
       });
    }else{
                fs.unlink(filePath, (err)=> {
                    return res.status(200).send({message: 'La extencion no es valida'});
                });
            }


    }else{
        return res.status(200).send({
            message: fileName
       });
    }

},

getImagenFile:function(req, res){
    var file = req.params.imagen;
    var path_file = './uploads/'+file;

    fs.exists(path_file, (exists)=>{
        if(exists){
            return res.sendFile(path.resolve(path_file));
        }else{
            return res.status(200).send({
                message:'La imagen no existe..'
            });
        }
    })

},




    
}

module.exports = controller;