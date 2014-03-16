'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * BalanceError Schema
 */
var BalanceErrorSchema = new Schema({
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
BalanceErrorSchema.path('message').validate(function(message) {
    return message.length;
}, 'Message cannot be blank');


/**
 * Statics
 */
BalanceErrorSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('BalanceError', BalanceErrorSchema);
