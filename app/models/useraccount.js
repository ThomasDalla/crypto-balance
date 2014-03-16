'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    Schema = mongoose.Schema;


/**
 * UserAccount Schema
 */
var UserAccountSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        default: '',
        trim: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    cryptosite: {
        type: Schema.ObjectId,
        ref: 'CryptoSite'
    },
    apiKey: {
        type: String,
        default: '',
        trim: true
    },
    apiSecret: {
        type: String,
        default: '',
        trim: true
    },
    apiAccount: {
        type: String,
        default: '',
        trim: true
    }
});

/**
 * Validations
 */
UserAccountSchema.path('title').validate(function(title) {
    return title.length;
}, 'Title cannot be blank');
UserAccountSchema.path('apiKey').validate(function(apiKey) {
    return apiKey.length;
}, 'API Key cannot be blank');
//UserAccountSchema.path('apiSecret').validate(function(apiSecret) {
//    return apiSecret.length;
//}, 'API Secret cannot be blank');

/**
 * Statics
 */
UserAccountSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name username').populate('cryptosite').exec(cb);
};

mongoose.model('UserAccount', UserAccountSchema);
