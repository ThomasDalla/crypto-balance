'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;

    $scope.menu = [
//        {
//            'title': 'Balances',
//            'link': 'balances'
//        },
        {
            'title': 'Balance Snapshots',
            'link': 'balancesnapshots'
        },
//        {
//            'title': 'Articles',
//            'link': 'articles'
//        },
//        {
//            'title': 'Create New Article',
//            'link': 'articles/create'
//        },
        {
            'title': 'Accounts',
            'link': 'useraccounts'
        }
//        ,{
//            'title': 'Add New Account',
//            'link': 'useraccounts/create'
//        }
    ];

    $scope.admin_menu = [
    {
        'title': 'Crypto Sites',
        'link': 'cryptosites'
    }];
    
    $scope.isCollapsed = false;
}]);