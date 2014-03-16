'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    CryptoSite = mongoose.model('CryptoSite'),
    _ = require('lodash');


/**
 * Find cryptosite by id
 */
exports.cryptosite = function(req, res, next, id) {
    CryptoSite.load(id, function(err, cryptosite) {
        if (err) return next(err);
        if (!cryptosite) return next(new Error('Failed to load cryptosite ' + id));
        req.cryptosite = cryptosite;
        next();
    });
};

/**
 * Create a cryptosite
 */
exports.create = function(req, res) {
    var cryptosite = new CryptoSite(req.body);
    cryptosite.user = req.user;

    cryptosite.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                cryptosite: cryptosite
            });
        } else {
            res.jsonp(cryptosite);
        }
    });
};

/**
 * Update a cryptosite
 */
exports.update = function(req, res) {
    var cryptosite = req.cryptosite;

    cryptosite = _.extend(cryptosite, req.body);

    cryptosite.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                cryptosite: cryptosite
            });
        } else {
            res.jsonp(cryptosite);
        }
    });
};

/**
 * Delete an cryptosite
 */
exports.destroy = function(req, res) {
    var cryptosite = req.cryptosite;

    cryptosite.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                cryptosite: cryptosite
            });
        } else {
            res.jsonp(cryptosite);
        }
    });
};

/**
 * Show an cryptosite
 */
exports.show = function(req, res) {
    res.jsonp(req.cryptosite);
};

/**
 * List of CryptoSites
 */
exports.all = function(req, res) {
    CryptoSite.find().sort('-created').exec(function(err, cryptosites) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(cryptosites);
        }
    });
};