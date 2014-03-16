'use strict';

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

/**
 * User authorizations routing middleware
 */
exports.user = {
    hasAuthorization: function(req, res, next) {
        if (req.profile.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};

/**
 * Article authorizations routing middleware
 */
exports.article = {
    hasAuthorization: function(req, res, next) {
        if (req.article.user.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};

/**
 * CryptoSite authorizations routing middleware
 */
exports.cryptosite = {
    hasAuthorization: function(req, res, next) {
        next();
    }
};

/**
 * UserAccount authorizations routing middleware
 */
exports.useraccount = {
    hasAuthorization: function(req, res, next) {
        if (req.useraccount.user.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};

/**
 * Balances authorizations routing middleware
 */
exports.balances = {
    hasAuthorization: function(req, res, next) {
        next();
    }
};
/**
 * BalanceSnapshots authorizations routing middleware
 */
exports.balancesnapshot = {
    hasAuthorization: function(req, res, next) {
        if (req.balancesnapshot.user.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};