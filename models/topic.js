'use strict'
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;

//Modelo de Commentarios
var CommentSchema = Schema ({
    content: String,
    date: {type: Date, default: Date.now},
    user: {type: Schema.ObjectId, ref: 'User'}
});

var Comment = mongoose.model('Comment', CommentSchema);

//Modelo de los Topicos (temas)
var TopicSchema = Schema({
    title: String,
    content:String,
    category: String,
    imagen:String,
    date: {type: Date, default: Date.now},
    user: {type: Schema.ObjectId, ref: 'User'},
    comments: [CommentSchema]
});

//Cargar la paginacion
TopicSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Topic', TopicSchema);