'use strict';
var request = require('request');
var async = require('async');
//request = request.defaults({
//    'proxy': 'http://user:pass@host:port',
//    'https-proxy': 'http://user:pass@host:port'
//});

var GMC_BASE = "https://give-me-coins.com/pool/";
var GMC_PATH = {
    LTC: 'api-ltc',
    BTC: 'api-btc',
    FTC: 'api-ftc'
};

function GiveMeCoins() {
    var self = this;
    self.getBalance = function(apiKey, callback) {
        var balances = [];
        var tasks = [];
        var coins = ["BTC", "LTC", "FTC"];
        var errors = [];
        for (var i = 0; i<coins.length; i++){
            (function(){
                var currentCcy = coins[i];
                tasks.push(function(localCallback) {
                    var localCcy = currentCcy;
                    request.get({
                        url:     GMC_BASE + GMC_PATH[localCcy] + "?api_key=" + apiKey
                    }, function(err, res, body){
                        var json;
                        if (err  || !res || res.statusCode != 200) {
                            var error = {
                                message: 'An error occured retreiving ' + localCcy + ' from GMC',
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
                                    message: "GiveMeCoins " +localCcy+ " responded with html:\n" + body,
                                    details: err
                                });
                                return localCallback();
                            } else {
                                errors.push({
                                    message: "JSON parse error " +localCcy+ ".",
                                    details: err
                                });
                                return localCallback();
                            }
                        }
                        if (json['confirmed_rewards']==undefined || json['confirmed_rewards']==null){
                            errors.push({
                                message: "Could not retrieve the " +localCcy+ " from GiveMeCoins",
                                details: err
                            });
                            return localCallback();
                        }
                        else {
                            var balance = Number(json['confirmed_rewards']);
                            if (balance>0){
                                balances.push({
                                    currency: localCcy,
                                    amount: balance
                                });
                            }
                            return localCallback();
                        }
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

module.exports = GiveMeCoins;