'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Rate Schema
 */
var RateSchema = new Schema({
    currency_from: {
        type: String,
        default: '',
        trim: true
    },
    currency_to: {
        type: String,
        default: '',
        trim: true
    },
    value: {
        type: Number,
        default: 1
    }
});

/**
 * Validations
 */
RateSchema.path('currency_from').validate(function(currency_from) {
    return currency_from.length;
}, 'Currency FROM cannot be blank');
RateSchema.path('currency_to').validate(function(currency_to) {
    return currency_to.length;
}, 'Currency TO cannot be blank');


/**
 * Statics
 */
RateSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Rate', RateSchema);
