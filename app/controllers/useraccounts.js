'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    UserAccount = mongoose.model('UserAccount'),
    User = mongoose.model('User'),
    CryptoSite = mongoose.model('CryptoSite'),
    Secrets = require('../../node_libs/secrets/secrets'),
    _ = require('lodash');


/**
 * Find useraccount by id
 */
exports.useraccount = function(req, res, next, id) {
    UserAccount.load(id, function(err, useraccount) {
        if (err) return next(err);
        if (!useraccount) return next(new Error('Failed to load useraccount ' + id));
        req.useraccount = useraccount;
        next();
    });
};

/**
 * Create a useraccount
 */
exports.create = function(req, res) {
    var useraccount = new UserAccount(req.body);
    useraccount.user = req.user;

    User.findById(req.user._id).select('salt').exec(function(err, user){
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                useraccount: useraccount
            });
        }
        else {

            if (user===undefined) {
                return res.send('users/signup', {
                    errors: err.errors,
                    useraccount: useraccount
                });
            }
            else {

                // Encrypt the api key and secret
                var secrets = new Secrets();

                // find the cryptosite
                CryptoSite.findById(req.body.cryptosite).exec(function(err, cryptosite){
                    if (err!=undefined || cryptosite==undefined) {
                        useraccount.error = {
                            message: 'Error finding the cryptosite',
                            details: err
                        };
                        return res.jsonp(useraccount);
                    }
                    else {

                        if (cryptosite.apiKey.encrypt===true) {
                            useraccount.apiKey = secrets.encrypt(useraccount.apiKey, user.salt);
                        }
                        if (cryptosite.apiSecret.encrypt===true) {
                            useraccount.apiSecret = secrets.encrypt(useraccount.apiSecret, user.salt);
                        }
                        if (cryptosite.apiAccount.encrypt===true) {
                            useraccount.apiAccount = secrets.encrypt(useraccount.apiAccount, user.salt);
                        }

                        useraccount.save(function(err) {
                            if (err) {
                                useraccount.error = {
                                    message: 'Error saving the account',
                                    details: err.errors
                                };
                            }
                            return res.jsonp(useraccount);
                        });
                    }
                });

            }
        }
    });
};

/**
 * Update a useraccount
 */
exports.update = function(req, res) {

    var originalKey = req.useraccount.apiKey;
    var originalSecret = req.useraccount.apiSecret;
    var originalAccount = req.useraccount.apiAccount;

//    console.log('req.body');
//    console.log(req.body);
//    console.log('req.useraccount');
//    console.log(req.useraccount);

    var useraccount = req.useraccount;

    useraccount = _.extend(useraccount, req.body);

//    console.log('useraccount');
//    console.log(useraccount);


    User.findById(req.user._id).select('salt').exec(function(err, user){
        if (err || user===undefined) {
            return res.send('users/signup', {
                errors: err.errors,
                useraccount: useraccount
            });
        }
        else {

            // Encrypt the api key and secret
            var secrets = new Secrets();

            if (req.body.apiKey!==undefined&&req.body.apiKey.length) {
                //console.log('encrypting a new key');
                if (useraccount.cryptosite.apiKey.encrypt===true) {
                    useraccount.apiKey = secrets.encrypt(req.body.apiKey, user.salt);
                } else {
                    useraccount.apiKey = req.body.apiKey;
                }
            }
            else {
                //console.log('not changing the key');
                useraccount.apiKey = originalKey;
            }
            if (req.body.apiSecret!==undefined&&req.body.apiSecret.length) {
                //console.log('encrypting a new secret');
                if (useraccount.cryptosite.apiKey.encrypt===true) {
                    useraccount.apiSecret = secrets.encrypt(req.body.apiSecret, user.salt);
                } else {
                    useraccount.apiSecret = req.body.apiSecret;
                }
            }
            else {
                //console.log('not changing the secret');
                useraccount.apiSecret = originalSecret;
            }
            if (req.body.apiAccount!==undefined&&req.body.apiAccount.length) {
                //console.log('encrypting a new account');
                if (useraccount.cryptosite.apiAccount.encrypt===true) {
                    useraccount.apiAccount = secrets.encrypt(req.body.apiAccount, user.salt);
                } else {
                    useraccount.apiAccount = req.body.apiAccount;
                }
            }
            else {
                //console.log('not changing the secret');
                useraccount.apiAccount = originalAccount;
            }

//            console.log('useraccount before save');
//            console.log(useraccount);

            useraccount.save(function(err) {
                if (err) {
                    return res.send('users/signup', {
                        errors: err.errors,
                        useraccount: useraccount
                    });
                } else {
                    res.jsonp(useraccount);
                }
            });
        }
    });

};

/**
 * Delete an useraccount
 */
exports.destroy = function(req, res) {
    var useraccount = req.useraccount;

    useraccount.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                useraccount: useraccount
            });
        } else {
            res.jsonp(useraccount);
        }
    });
};

/**
 * Show a useraccount
 */
exports.show = function(req, res) {
//    req.useraccount.apiKey = '';
//    req.useraccount.apiSecret = '';
    res.jsonp(req.useraccount);
};

/**
 * List of UserAccounts
 */
exports.all = function(req, res) {
    UserAccount.find().where('user').equals(req.user).sort('title').populate('user', 'name username').populate('cryptosite').select('user cryptosite enabled title apiKey apiSecret apiAccount').exec(function(err, useraccounts) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(useraccounts);
        }
    });
};