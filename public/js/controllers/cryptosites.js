'use strict';

angular.module('mean.cryptosites').controller('CryptoSitesController', ['$scope', '$routeParams', '$location', 'Global', 'CryptoSites', function ($scope, $routeParams, $location, Global, CryptoSites) {
    $scope.global = Global;

    if (!$scope.global.authenticated) {
        document.location.href = document.location.origin+'/signin'
    }

    $scope.cryptosite_types = ['Exchange', 'Mining Pool', 'Wallet'];
    $scope.error = {};

    $scope.apiKey = {
        required: true,
        encrypt: true,
        text: "API Key"
    };
    $scope.apiSecret = {
        required: true,
        encrypt: true,
        text: "API Secret"
    };
    $scope.apiAccount = {
        required: false,
        encrypt: true,
        text: "Account"
    };

    $scope.create = function() {

        var cryptosite = new CryptoSites({
            title: this.title,
            type: this.type,
            enabled: this.enabled,
            help: this.help,
            apiKey: {
                required: this.apiKey.required,
                encrypt: this.apiKey.encrypt,
                text: this.apiKey.text.length?this.apiKey.text:'API Key'
            },
            apiSecret: {
                required: this.apiSecret.required,
                encrypt: this.apiSecret.encrypt,
                text: this.apiSecret.text.length?this.apiSecret.text:'API Secret'
            },
            apiAccount: {
                required: this.apiAccount.required,
                encrypt: this.apiAccount.encrypt,
                text: this.apiAccount.text.length?this.apiAccount.text:'API Account'
            }
        });
        cryptosite.$save(function(response) {
            if (response.errors == undefined){
                $location.path('cryptosites/' + response._id);
            }
            else {
                $scope.error = response.errors.type;
                //$scope.cryptosite = response.cryptosite;
            }
        });
//        this.title = '';
//        this.type = '';
    };

    $scope.remove = function(cryptosite) {
        if (cryptosite) {
            cryptosite.$remove();

            for (var i in $scope.cryptosites) {
                if ($scope.cryptosites[i] === cryptosite) {
                    $scope.cryptosites.splice(i, 1);
                }
            }
        }
        else {
            $scope.cryptosite.$remove();
            $location.path('cryptosites');
        }
    };

    $scope.update = function() {
        var cryptosite = $scope.cryptosite;
        if (!cryptosite.updated) {
            cryptosite.updated = [];
        }
        cryptosite.updated.push(new Date().getTime());

        cryptosite.$update(function() {
            $location.path('cryptosites/' + cryptosite._id);
        });
    };

    $scope.find = function() {
        CryptoSites.query(function(cryptosites) {
            $scope.cryptosites = cryptosites;
        });
    };

    $scope.findOne = function() {
        CryptoSites.get({
            cryptositeId: $routeParams.cryptositeId
        }, function(cryptosite) {
            $scope.cryptosite = cryptosite;
        });
    };
}]);