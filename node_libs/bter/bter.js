'use strict';
var request = require('request');
var crypto = require('crypto');
var qs = require('querystring');
var microtime = require('microtime');

//request = request.defaults({
//    'proxy': 'http://user:pass@host:port',
//    'https-proxy': 'http://user:pass@host:port'
//});

var BTER_BASE = "https://bter.com/api/";
var BTER_API = "1";
var GET_FUNDS_PATH = "/private/getfunds";

function BterClient(apiKey, apiSecret) {
    var self = this;
    self.apiKey = apiKey;
    self.apiSecret = apiSecret;

    self.getUrl = function(path){
        return BTER_BASE + BTER_API + path;
    };

    self.getFunds = function(callback) {
        //var now = new Date();
        var payload = {
            nonce: String(microtime.now())
            //nonce: (now.getTime() * 1000 + now.getMilliseconds()).toString()
        };
        var postData = qs.stringify(payload);
        var sign = crypto
            .createHmac('sha512', new Buffer(self.apiSecret, 'utf8'))
            .update(new Buffer(postData, 'utf8'))
            .digest('hex');
        var url = self.getUrl(GET_FUNDS_PATH);
        var headers = {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'KEY': self.apiKey,
            'SIGN': sign
        };
//        console.log(self.apiKey);
//        console.log(self.apiSecret);
//        console.log(postData);
//        console.log(sign);
//        console.log(url);
//        console.log(headers);
        request.post({
            headers: headers,
            url:     url,
            body:    postData
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
                    return callback(new Error("Bter responded with html:\n" + body));
                } else {
                    return callback(new Error("JSON parse error: " + err));
                }
            }

            return callback(json);
        });
    }
}

module.exports = BterClient;