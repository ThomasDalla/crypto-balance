'use strict';

angular.module('mean.balances').controller('BalancesController', ['$scope', '$routeParams', '$location', 'Global', 'Balances', function ($scope, $routeParams, $location, Global, Balances) {
    $scope.global = Global;

    if (!$scope.global.authenticated) {
        document.location.href = document.location.origin+'/signin'
    }
    $scope.errors = [];

    $scope.find = function() {
        Balances.getBalances(function(balances) {
            $scope.balances = balances;
            $scope.errors = balances.errors;
        },
        function(error, status){
            console.log(error);
            $scope.errors.push(error);
        });
    };
}]);