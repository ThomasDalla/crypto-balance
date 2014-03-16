'use strict';
var request = require('request');
//request = request.defaults({
//    'proxy': 'http://user:pass@host:port',
//    'https-proxy': 'http://user:pass@host:port'
//});

var CRYPTOCOINCHARTS_URL = "http://www.cryptocoincharts.info/v2/api/";
var TRADING_PAIRS_PATH = "tradingPairs";

var urlEncode = function(obj) {
    var arr = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            arr.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return arr.join("&");
}

function CryptoCoinChartsClient() {
    var self = this;
    self.getTradingPairs = function(arrayOfPairs, callback) {
        var post_data = urlEncode({
            pairs: arrayOfPairs.join(',').toLowerCase()
        });
        request.post({
            headers: {'content-type' : 'application/x-www-form-urlencoded'},
            url:     CRYPTOCOINCHARTS_URL+TRADING_PAIRS_PATH,
            body:    post_data
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
                    return callback(new Error("CryptoCoinCharts responded with html:\n" + body));
                } else {
                    return callback(new Error("JSON parse error: " + err));
                }
            }

            callback(json);
        });
    }
}

module.exports = CryptoCoinChartsClient;