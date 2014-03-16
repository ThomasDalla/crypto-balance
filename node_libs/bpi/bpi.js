//https://api.coindesk.com/v1/bpi/currentprice.json

'use strict';
var request = require('request');
//request = request.defaults({
//    'proxy': 'http://user:pass@host:port',
//    'https-proxy': 'http://user:pass@host:port'
//});

var BPI_URL = "https://api.coindesk.com/v1/";
var TRADING_PAIRS_PATH = "bpi/currentprice.json";

function BitcoinPriceIndex() {
    var self = this;
    self.getBpi = function(callback) {
        request.get({
            url:     BPI_URL+TRADING_PAIRS_PATH
        }, function(err, res, body){
            var json;

            if (err  || !res || res.statusCode != 200) {
                return callback(err || new Error("Request failed"));
            }

            // This try-catch handles cases where Mt.Gox returns 200 but responds with HTML,
            // causing the JSON.parse to throw
            try {
                json = JSON.parse(body);
            } catch(err) {
                if (body.indexOf("<") != -1) {
                    return callback(new Error("CoinDesk BPI responded with html:\n" + body));
                } else {
                    return callback(new Error("JSON parse error: " + err));
                }
            }

            callback(json);
        });
    }
}

module.exports = BitcoinPriceIndex;