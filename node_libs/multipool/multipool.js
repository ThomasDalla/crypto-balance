'use strict';
var request = require('request');

//request = request.defaults({
//    'proxy': 'http://user:pass@host:port',
//    'https-proxy': 'http://user:pass@host:port'
//});

var MULTIPOOL_BASE = "http://api.multipool.us";
var MULTIPOOL_API = "/api.php";

function MultiPoolClient() {
    var self = this;

    self.getUrl = function(key){
        return MULTIPOOL_BASE + MULTIPOOL_API + "?api_key=" + key;
    };

    self.getStats = function(apiKey, callback) {
        var url = self.getUrl(apiKey);
        request.get(url, function(err, res, body){
            var json;

            if (err  || !res || res.statusCode != 200) {
                return callback(
                    {
                        error: {
                            message:"Request failed",
                            details: err
                        }
                    }
                );
            }

            // This try-catch handles cases where Mt.Gox returns 200 but responds with HTML,
            // causing the JSON.parse to throw
            try {
                json = JSON.parse(body);
            } catch(err) {
                if (body.indexOf("<") != -1) {
                    return callback({
                        error: {
                            message:"MultiPool responded with html.",
                            details: body
                        }
                    });
                } else {
                    return callback({
                        error:{
                            message: "MultiPool JSON parse error.",
                            details: {
                                body: body,
                                err: err
                            }
                        }
                    });
                }
            }

            return callback(json);
        });
    }
}

module.exports = MultiPoolClient;