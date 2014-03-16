'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    BalanceSchema = require('./balance'),
    BalanceErrorSchema = require('./balanceerror'),
    BalanceSummarySchema = require('./balancesummary'),
    RateSchema = require('./rate');


/**
 * BalanceSnapshot Schema
 */
var BalanceSnapshotSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    balance_errors: [BalanceErrorSchema],
    summary: {
        BTC: BalanceSummarySchema,
        USD: BalanceSummarySchema
    },
    balances: [BalanceSchema],
    rates: [RateSchema],
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    source: String
});

/**
 * Validations
 */
//BalanceSnapshotSchema.path('currency').validate(function(currency) {
//    return currency.length;
//}, 'Currency cannot be blank');


/**
 * Statics
 */
BalanceSnapshotSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').exec(cb);
};

mongoose.model('BalanceSnapshot', BalanceSnapshotSchema);
