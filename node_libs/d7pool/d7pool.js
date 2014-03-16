'use strict';
var request = require('request');

//request = request.defaults({
//    'proxy': 'http://user:pass@host:port',
//    'https-proxy': 'http://user:pass@host:port'
//});

var D7POOL_BASE = "https://ppcoin.d7.lt/";
var D7POOL_API = "api.php";

function D7PoolClient(apiKey) {
    var self = this;
    self.apiKey = apiKey;

    self.getUrl = function(key){
        return D7POOL_BASE + D7POOL_API + "?api_key=" + key;
    };

    self.getStats = function(callback) {
        var url = self.getUrl(self.apiKey);
        request.get(url, function(err, res, body){
            var json;

            if (err  || !res || res.statusCode != 200) {
                return callback({error:{message:"Request failed",
                details: err}});
            }

            // This try-catch handles cases where Mt.Gox returns 200 but responds with HTML,
            // causing the JSON.parse to throw
            try {
                json = JSON.parse(body);
            } catch(err) {
                if (body.indexOf("<") != -1) {
                    return callback({error:{message:"D7 Pool responded with html.",
                    details: body}});
                } else {
                    return callback({error:{message: "D7 Pool JSON parse error.",
                        details: {
                            body: body,
                            err: err
                        }}});
                }
            }

            return callback(json);
        });
    }
}

module.exports = D7PoolClient;