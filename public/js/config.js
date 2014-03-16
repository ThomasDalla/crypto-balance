'use strict';

//Setting up route
angular.module('mean').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/articles', {
            templateUrl: 'views/articles/list.html'
        }).
        when('/articles/create', {
            templateUrl: 'views/articles/create.html'
        }).
        when('/articles/:articleId/edit', {
            templateUrl: 'views/articles/edit.html'
        }).
        when('/articles/:articleId', {
            templateUrl: 'views/articles/view.html'
        }).
        when('/cryptosites', {
            templateUrl: 'views/cryptosites/list.html'
        }).
        when('/cryptosites/create', {
            templateUrl: 'views/cryptosites/create.html'
        }).
        when('/cryptosites/:cryptositeId/edit', {
            templateUrl: 'views/cryptosites/edit.html'
        }).
        when('/cryptosites/:cryptositeId', {
            templateUrl: 'views/cryptosites/view.html'
        }).
        when('/useraccounts', {
            templateUrl: 'views/useraccounts/list.html'
        }).
        when('/useraccounts/create', {
            templateUrl: 'views/useraccounts/create.html'
        }).
        when('/useraccounts/:useraccountId/edit', {
            templateUrl: 'views/useraccounts/edit.html'
        }).
        when('/balances', {
            templateUrl: 'views/balances/list.html'
        }).
        when('/balancesnapshots', {
            templateUrl: 'views/balancesnapshots/list.html'
        }).
        when('/balancesnapshots/:balancesnapshotId', {
            templateUrl: 'views/balancesnapshots/view.html'
        }).
        when('/', {
            templateUrl: 'views/index.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

//Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);