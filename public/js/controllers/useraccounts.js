'use strict';

angular.module('mean.useraccounts').controller('UserAccountsController', ['$scope', '$routeParams', '$location', '$filter', 'Global', 'CryptoSites', 'UserAccounts', function ($scope, $routeParams, $location, $filter, Global, CryptoSites, UserAccounts) {
    $scope.global = Global;

    if (!$scope.global.authenticated) {
        document.location.href = document.location.origin+'/signin'
    }

    $scope.error = {};

    var preselectSite = function() {
        if ($scope.useraccount != undefined && $scope.available_cryptosites!=undefined) {
            for (var i=0; i<$scope.available_cryptosites.length; i++){
                if ($scope.available_cryptosites[i]._id==$scope.useraccount.cryptosite._id){
                    $scope.useraccount.cryptosite = $scope.available_cryptosites[i];
                    break;
                }
            }
        }
    };

    this.apiKey = "";
    this.apiSecret = "";
    this.apiAccount = "";

    CryptoSites.query(function(cryptosites) {
        $scope.available_cryptosites = $filter('filter')(cryptosites, {enabled:true});
        preselectSite();

    });

    $scope.create = function() {
        if (this.cryptosite == undefined){
            $scope.error = {
                message: 'Please choose a Site'
            }
        }
        else {
            var useraccount = new UserAccounts({
                title: this.title,
                enabled: this.enabled,
                cryptosite: this.cryptosite._id,
                apiKey: this.apiKey,
                apiSecret: this.apiSecret,
                apiAccount: this.apiAccount
            });
            useraccount.$save(function(response) {
                if (response.errors == undefined){
                    $location.path('useraccounts');
                }
                else {
                    $scope.error = response.errors.type;
                }
            });
        }
    };

    $scope.remove = function(useraccount) {
        if (useraccount) {
            useraccount.$remove();

            for (var i in $scope.useraccounts) {
                if ($scope.useraccounts[i] === useraccount) {
                    $scope.useraccounts.splice(i, 1);
                }
            }
        }
        else {
            $scope.useraccount.$remove();
            $location.path('useraccounts');
        }
    };

    $scope.update = function() {
        var useraccount = $scope.useraccount;
        if (!useraccount.updated) {
            useraccount.updated = [];
        }
        useraccount.updated.push(new Date().getTime());

        useraccount.$update(function(response) {
            if (response.errors == undefined){
                $location.path('useraccounts');
            }
            else {
                $scope.error = response.errors.type;
            }
        });
    };

    $scope.find = function() {
        UserAccounts.query(function(useraccounts) {
            $scope.useraccounts = useraccounts;
        });
    };

    $scope.findOne = function() {
        UserAccounts.get({
            useraccountId: $routeParams.useraccountId
        }, function(useraccount) {
            //useraccount.cryptosite = useraccount.cryptosite._id;
            // map the existing object
            $scope.useraccount = useraccount;
            // If encreypted, don't show apiKey/Secret/account!
            if (useraccount.cryptosite.apiKey.encrypt===true){
                useraccount.apiKey = "";
            }
            if (useraccount.cryptosite.apiSecret.encrypt===true){
                useraccount.apiSecret = "";
            }
            if (useraccount.cryptosite.apiAccount.encrypt===true){
                useraccount.apiAccount = "";
            }
            preselectSite();
        });
    };
}]);