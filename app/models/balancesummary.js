'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * BalanceSummary Schema
 */
var BalanceSummarySchema = new Schema({
    currency: {
        type: String,
        default: '',
        trim: true
    },
    from_crypto: {
        type: Number,
        default: 0
    },
    from_fiat: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    }
});

/**
 * Validations
 */
BalanceSummarySchema.path('currency').validate(function(currency) {
    return currency.length;
}, 'Currency cannot be blank');


/**
 * Statics
 */
BalanceSummarySchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('BalanceSummary', BalanceSummarySchema);
