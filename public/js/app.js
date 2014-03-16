'use strict';

angular.module('mean', ['ngCookies', 'ngResource', 'ngSanitize', 'btford.markdown', 'ngRoute', 'ui.bootstrap', 'ui.route', 'mean.system', 'mean.articles', 'mean.cryptosites', 'mean.useraccounts', 'mean.balances', 'mean.balancesnapshots']);

angular.module('mean.system', []);
angular.module('mean.articles', []);
angular.module('mean.cryptosites', []);
angular.module('mean.useraccounts', []);
angular.module('mean.balances', []);
angular.module('mean.balancesnapshots', []);