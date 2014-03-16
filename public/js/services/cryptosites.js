'use strict';

//CryptoSites service used for cryptosites REST endpoint
angular.module('mean.cryptosites').factory('CryptoSites', ['$resource', function($resource) {
    return $resource('cryptosites/:cryptositeId', {
        cryptositeId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    }

    );
}]);