'use strict';

angular.module('mean.balancesnapshots').controller('BalanceSnapshotsController', ['$scope', '$routeParams', '$location', '$filter', 'Global', 'Balances', 'BalanceSnapshots', function ($scope, $routeParams, $location, $filter, Global, Balances, BalanceSnapshots) {
    $scope.global = Global;
    $scope.errors = [];

    if (!$scope.global.authenticated) {
        document.location.href = document.location.origin+'/signin'
    }

    $scope.remove = function(balancesnapshot) {
        if (balancesnapshot) {
            balancesnapshot.$remove();

            for (var i in $scope.balancesnapshots) {
                if ($scope.balancesnapshots[i] === balancesnapshot) {
                    $scope.balancesnapshots.splice(i, 1);
                }
            }
        }
        else {
            $scope.balancesnapshot.$remove();
            $location.path('balancesnapshots');
        }
    };

    $scope.find = function() {
        BalanceSnapshots.query(function(balancesnapshots) {
            balancesnapshots.currencies = [];
            for (var balanceSnapshotIndex in balancesnapshots){
                var snap = balancesnapshots[balanceSnapshotIndex];
                snap.ratesObj = {};
                for (var rateIndex in snap.rates) {
                    var rate = snap.rates[rateIndex];
                    snap.ratesObj[rate.currency_from+rate.currency_to] = rate.value;
                }
                snap.balance = {};
                for (var balanceIndex in snap.balances){
                    var balance = snap.balances[balanceIndex];
                    var ccy = balance.currency;
                    snap.balance[ccy] = balance.amount;
                    if (balancesnapshots.currencies.indexOf(ccy)==-1){
                        balancesnapshots.currencies.push(ccy);
                    }
                }
            }
            $scope.balancesnapshots = balancesnapshots;
        });
    };

    $scope.findOne = function() {
        BalanceSnapshots.get({
            balancesnapshotId: $routeParams.balancesnapshotId
        }, function(balancesnapshot) {
            //balancesnapshot.cryptosite = balancesnapshot.cryptosite._id;
            // map the existing object
            $scope.balancesnapshot = balancesnapshot;
        });
    };

    $scope.generatingSnapshot = false;
    $scope.generateSnapshot = function() {
        $scope.generatingSnapshot = true;
        Balances.getBalances(
        function(balanceSnapshot){
            $scope.generatingSnapshot = false;
            $location.path('/balancesnapshots/' + balanceSnapshot._id);
        },
        function(err, status){
            $scope.generatingSnapshot = false;
            $scope.errors.push(err);
        });
    }

}]);