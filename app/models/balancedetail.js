'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * BalanceDetail Schema
 */
var BalanceDetailSchema = new Schema({
    currency: {
        type: String,
        default: '',
        trim: true
    },
    account: {
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
    }
});

/**
 * Validations
 */
BalanceDetailSchema.path('currency').validate(function(currency) {
    return currency.length;
}, 'Currency cannot be blank');
BalanceDetailSchema.path('account').validate(function(account) {
    return account.length;
}, 'Account cannot be blank');


/**
 * Statics
 */
BalanceDetailSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('BalanceDetail', BalanceDetailSchema);
