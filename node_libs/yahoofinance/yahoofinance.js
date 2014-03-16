/**
 * Created by dallagt on 27/01/14.
 */

'use strict';
var request = require('request');
//request = request.defaults({
//    'proxy': 'http://user:pass@host:port',
//    'https-proxy': 'http://user:pass@host:port'
//});
var qs = require('querystring');

var YQL_BASE = "http://query.yahooapis.com/";
var YQL_PATH = "/v1/public/yql";

function YahooFinance() {
    var self = this;
    self.getQuotes = function(arrayOfPairs, callback) {
        var params = {
            q:'select * from yahoo.finance.xchange where pair in ("'+arrayOfPairs.join('","')+'")',
            format:'json',
            env:'store://datatables.org/alltableswithkeys',
            callback: ''
        };
        request.get({
            url:     YQL_BASE+YQL_PATH + "?" + qs.stringify(params)
        }, function(err, res, body){
            var json;
            if (err  || !res || res.statusCode != 200) {
                return callback(err || new Error("Request failed"));
            }
            try {
                json = JSON.parse(body);
            } catch(err) {
                if (body.indexOf("<") != -1) {
                    return callback(new Error("YahooFinance responded with html:\n" + body));
                } else {
                    return callback(new Error("JSON parse error: " + err));
                }
            }
            if (json.query.results==undefined || json.query.results==null){
                return callback(new Error("Could not retrieve the FX Rates from Yahoo Finance"));
            }
            else {
                var rates = [];
                if (Object.prototype.toString.call( json.query.results.rate ) == "[object Object]") {
                    rates.push(json.query.results.rate);
                } else {
                    rates = json.query.results.rate;
                }
                return callback(rates);
            }
        });
    }
}

module.exports = YahooFinance;