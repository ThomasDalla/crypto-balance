'use strict';
var request = require('request');
var async = require('async');
//request = request.defaults({
//    'proxy': 'http://user:pass@host:port',
//    'https-proxy': 'http://user:pass@host:port'
//});

var YPOOL_BASE = "http://ypool.net/api/personal_stats";

function YPool() {
    var self = this;
    self.getUrl = function(apiKey, coinType){
        return YPOOL_BASE + "?key=" + apiKey + "&coinType=" + coinType;
    };
    self.getBalance = function(apiKey, callback) {
        var balances = [];
        var tasks = [];
        var coins = ["FTC","XPM","PTS","DOGE","MTS","RIC"];
        var errors = [];
        for (var i = 0; i<coins.length; i++){
            (function(){
                var currentCcy = coins[i];
                tasks.push(function(localCallback) {
                    var localCcy = currentCcy;
                    var url=self.getUrl(apiKey, localCcy);
                    request.get(url, function(err, res, body) {
                        var json;
                        if (err  || !res || res.statusCode != 200) {
                            var error = {
                                message: 'An error occured retreiving ' + localCcy + ' from YPool',
                                details: err
                            };
                            errors.push(error);
                            return localCallback();
                        }
                        try {
                            json = JSON.parse(body);
                        } catch(err) {
                            if (body.indexOf("<") != -1) {
                                errors.push({
                                    message: "YPool " +localCcy+ " responded with html.",
                                    details: body
                                });
                                return localCallback();
                            } else {
                                errors.push({
                                    message: "YPool JSON parse error " +localCcy+ ".",
                                    details: {
                                        err: err,
                                        body: body
                                    }
                                });
                                return localCallback();
                            }
                        }
                        if (json['balance']==undefined || json['balance']==null){
                            errors.push({
                                message: "Could not retrieve the " +localCcy+ " from YPool",
                                details: json
                            });
                        }
                        else {
                            var balance = Number(json['balance']);
                            if (isFinite(balance)&&balance>0){
                                balances.push({
                                    currency: localCcy,
                                    amount: balance
                                });
                            }
                        }
                        // timeout de 0.5s
                        setTimeout(localCallback, 500);
                    });
                });
            })();
        }

        async.parallel(tasks, function() {
            callback({
                balances: balances,
                errors: errors
            });
        });

    }
}

module.exports = YPool;