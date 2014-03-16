'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    BalanceSnapshot = mongoose.model('BalanceSnapshot'),
    _ = require('lodash');


/**
 * Find balancesnapshot by id
 */
exports.balancesnapshot = function(req, res, next, id) {
    BalanceSnapshot.load(id, function(err, balancesnapshot) {
        if (err) return next(err);
        if (!balancesnapshot) return next(new Error('Failed to load balancesnapshot ' + id));
        req.balancesnapshot = balancesnapshot;
        next();
    });
};

/**
 * Create a balancesnapshot
 */
exports.create = function(req, res) {
    var balancesnapshot = new BalanceSnapshot(req.body);
    balancesnapshot.user = req.user;

    balancesnapshot.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                balancesnapshot: balancesnapshot
            });
        } else {
            res.jsonp(balancesnapshot);
        }
    });
};

/**
 * Update a balancesnapshot
 */
exports.update = function(req, res) {
    var balancesnapshot = req.balancesnapshot;

    balancesnapshot = _.extend(balancesnapshot, req.body);

    balancesnapshot.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                balancesnapshot: balancesnapshot
            });
        } else {
            res.jsonp(balancesnapshot);
        }
    });
};

/**
 * Delete a balancesnapshot
 */
exports.destroy = function(req, res) {
    var balancesnapshot = req.balancesnapshot;

    balancesnapshot.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                balancesnapshot: balancesnapshot
            });
        } else {
            res.jsonp(balancesnapshot);
        }
    });
};

/**
 * Show a balancesnapshot
 */
exports.show = function(req, res) {
    res.jsonp(req.balancesnapshot);
};

/**
 * List of BalanceSnapshots
 */
exports.all = function(req, res) {
    BalanceSnapshot.find().where('user').equals(req.user).sort('-timestamp').exec(function(err, balancesnapshots) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(balancesnapshots);
        }
    });
};