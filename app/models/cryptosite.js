'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * CryptoSite Schema
 */
var CryptoSiteSchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true
    },
    type: {
        type: String,
        default: '',
        trim: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    apiKey: {
        required: {
            type: Boolean,
            default: true
        },
        text: {
            type: String,
            default: 'API Key'
        },
        encrypt: {
            type: Boolean,
            default: true
        }
    },
    apiSecret: {
        required: {
            type: Boolean,
            default: false
        },
        text: {
            type: String,
            default: 'API Secret'
        },
        encrypt: {
            type: Boolean,
            default: true
        }
    },
    apiAccount: {
        required: {
            type: Boolean,
            default: false
        },
        text: {
            type: String,
            default: 'Account'
        },
        encrypt: {
            type: Boolean,
            default: true
        }
    },
    help: {
        type: String,
        default: ''
    }
});

/**
 * Validations
 */
CryptoSiteSchema.path('title').validate(function(title) {
    return title.length;
}, 'Title cannot be blank');
CryptoSiteSchema.path('type').validate(function(type) {
    return type.length;
}, 'Type cannot be blank');


/**
 * Statics
 */
CryptoSiteSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('CryptoSite', CryptoSiteSchema);
