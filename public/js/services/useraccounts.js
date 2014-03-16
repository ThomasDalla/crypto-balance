'use strict';

//Articles service used for articles REST endpoint
angular.module('mean.useraccounts').factory('UserAccounts', ['$resource', function($resource) {
    return $resource('useraccounts/:useraccountId', {
        useraccountId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);