'use strict';

//Articles service used for articles REST endpoint
angular.module('mean.balancesnapshots').factory('BalanceSnapshots', ['$resource', function($resource) {
    return $resource('balancesnapshots/:balancesnapshotId', {
        balancesnapshotId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);