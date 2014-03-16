'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Error Schema
 */
var ErrorSchema = new Schema({
    message: {
        type: String,
        default: '',
        trim: true
    },
    details: {
        type: Schema.Types.Mixed,
        default: {}
    },
    created: {
        type: Date,
        default: Date.now
    }
});

/**
 * Validations
 */
ErrorSchema.path('message').validate(function(message) {
    return message.length;
}, 'Message cannot be blank');


/**
 * Statics
 */
ErrorSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Error', ErrorSchema);
