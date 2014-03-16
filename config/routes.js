'use strict';

module.exports = function(app, passport, auth) {
    
    // User Routes
    var users = require('../app/controllers/users');
    app.get('/signin', users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);
    app.get('/users/me', users.me);

    // Setting up the users api
    app.post('/users', users.create);

    // Setting up the userId param
    app.param('userId', users.user);

    // Setting the local strategy route
    app.post('/users/session', passport.authenticate('local', {
        failureRedirect: '/signin',
        failureFlash: true
    }), users.session);

    // Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the github oauth routes
    app.get('/auth/github', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/github/callback', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);


    // Article Routes
    var articles = require('../app/controllers/articles');
    app.get('/articles', articles.all);
    app.post('/articles', auth.requiresLogin, articles.create);
    app.get('/articles/:articleId', articles.show);
    app.put('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.update);
    app.del('/articles/:articleId', auth.requiresLogin, auth.article.hasAuthorization, articles.destroy);

    // Finish with setting up the articleId param
    app.param('articleId', articles.article);

    // CryptoSite Routes
    var cryptosites = require('../app/controllers/cryptosites');
    app.get('/cryptosites', cryptosites.all);
    app.get('/cryptosites-enabled', cryptosites.allEnabled);
    app.post('/cryptosites', auth.requiresLogin, cryptosites.create);
    app.get('/cryptosites/:cryptositeId', cryptosites.show);
    app.put('/cryptosites/:cryptositeId', auth.requiresLogin, auth.cryptosite.hasAuthorization, cryptosites.update);
    app.del('/cryptosites/:cryptositeId', auth.requiresLogin, auth.cryptosite.hasAuthorization, cryptosites.destroy);

    // Finish with setting up the cryptositeId param
    app.param('cryptositeId', cryptosites.cryptosite);

    // UserAccount Routes
    var useraccounts = require('../app/controllers/useraccounts');
    app.get('/useraccounts', useraccounts.all);
    app.post('/useraccounts', auth.requiresLogin, useraccounts.create);
    app.get('/useraccounts/:useraccountId', useraccounts.show);
    app.put('/useraccounts/:useraccountId', auth.requiresLogin, auth.useraccount.hasAuthorization, useraccounts.update);
    app.del('/useraccounts/:useraccountId', auth.requiresLogin, auth.useraccount.hasAuthorization, useraccounts.destroy);

    // Finish with setting up the articleId param
    app.param('useraccountId', useraccounts.useraccount);

    // Balances Route
    var balances = require('../app/controllers/balances');
    app.get('/balances', auth.requiresLogin, auth.balances.hasAuthorization, balances.all);

    // BalanceSnapshots Routes
    var balancesnapshots = require('../app/controllers/balancesnapshots');
    app.get('/balancesnapshots', balancesnapshots.all);
    app.post('/balancesnapshots', auth.requiresLogin, balancesnapshots.create);
    app.get('/balancesnapshots/:balancesnapshotId', balancesnapshots.show);
    app.put('/balancesnapshots/:balancesnapshotId', auth.requiresLogin, auth.balancesnapshot.hasAuthorization, balancesnapshots.update);
    app.del('/balancesnapshots/:balancesnapshotId', auth.requiresLogin, auth.balancesnapshot.hasAuthorization, balancesnapshots.destroy);

    // Finish with setting up the articleId param
    app.param('balancesnapshotId', balancesnapshots.balancesnapshot);

    // Home route
    var index = require('../app/controllers/index');
    app.get('/', index.render);

};
