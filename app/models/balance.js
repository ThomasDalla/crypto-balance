'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Balance Schema
 */
var BalanceSchema = new Schema({
    currency: {
        type: String,
        default: '',
        trim: true
    },
    btc_equivalent: {
        type: Number,
        default: 0
    },
    usd_equivalent: {
        type: Number,
        default: 0
    },
    amount: {
        type: Number,
        default: 0
    },
    details: {
        type: [Schema.ObjectId],
        ref: 'BalanceDetail'
    }
});

/**
 * Validations
 */
BalanceSchema.path('currency').validate(function(currency) {
    return currency.length;
}, 'Currency cannot be blank');


/**
 * Statics
 */
BalanceSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Balance', BalanceSchema);
