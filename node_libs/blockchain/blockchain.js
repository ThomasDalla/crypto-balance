'use strict';
var request = require('request');

//request = request.defaults({
//    'proxy': 'http://user:pass@host:port',
//    'https-proxy': 'http://user:pass@host:port'
//});

var BLOCKCHAIN_BASE = "https://blockchain.info";
var BLOCKCHAIN_API = "/q/addressbalance/";
var SATOSHI = 100000000;

function BlockChainBalance() {
    var self = this;

    self.getUrl = function(walletAddress){
        return BLOCKCHAIN_BASE + BLOCKCHAIN_API + walletAddress + "?confirmations=6";
    };

    self.getBalance = function(walletAddress, callback) {
        var url = self.getUrl(walletAddress);
        request.get(url, function(err, res, body){

            var result;

            if (err  || !res || res.statusCode != 200) {
                result = {
                    error: {
                        message:"Request for wallet " + walletAddress+ " failed",
                        details: err
                    }
                };
            }
            else {
                var balance = Number(body);
                if (!body.length || !isFinite(balance)){
                    result = {
                        error: {
                            message: "Invalid Bitcoin Wallet Address ("+walletAddress+")",
                            details: body

                        }
                    }
                }
                else {
                    result = {
                        balance: balance / SATOSHI,
                        error: false
                    }
                }
            }

            return callback(result);
        });
    }
}

module.exports = BlockChainBalance;