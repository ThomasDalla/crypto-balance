'use strict';

//Balances service used for articles REST endpoint
angular.module('mean.balances').factory('Balances', ['$http', function($http) {
    return {
        getBalances: function(onSuccessCallback, onErrorCallback) {
            $http({
                method: "GET",
                url: '/balances'
            }).
            success(onSuccessCallback).
            error(onErrorCallback);
        }
    };
}]);