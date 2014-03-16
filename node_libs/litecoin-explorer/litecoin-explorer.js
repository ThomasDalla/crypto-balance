'use strict';
var request = require('request');

//request = request.defaults({
//    'proxy': 'http://user:pass@host:port',
//    'https-proxy': 'http://user:pass@host:port'
//});

var LITECOIN_EXPLORER_BASE = "http://explorer.litecoin.net/chain/Litecoin/q";
var LITECOIN_EXPLORER_CHECKADDRESS = "/checkaddress/";
var LITECOIN_EXPLORER_RECEIVED = "/getreceivedbyaddress/";
var LITECOIN_EXPLORER_SENT = "/getsentbyaddress/";

function LitecoinBalance() {
    var self = this;

    self.getCheckUrl = function(walletAddress){
        return LITECOIN_EXPLORER_BASE + LITECOIN_EXPLORER_CHECKADDRESS + walletAddress;
    };
    self.getReceivedUrl = function(walletAddress){
        return LITECOIN_EXPLORER_BASE + LITECOIN_EXPLORER_RECEIVED + walletAddress;
    };
    self.getSentUrl = function(walletAddress){
        return LITECOIN_EXPLORER_BASE + LITECOIN_EXPLORER_SENT + walletAddress;
    };


    var isValidAddress = function(walletAddress, callback) {
        var url = self.getCheckUrl(walletAddress);
        request.get(url, function(err, res, body){

            var result;

            if (err  || !res || res.statusCode != 200) {
                result = {
                    error: {
                        message:"Request for Litecoin wallet " + walletAddress+ " failed ("+url+")",
                        details: err
                    }
                };
            }
            else {
                var balance = Number(body);
                if (!body.length || !isFinite(balance)){
                    result = {
                        error: {
                            message: "Invalid Litecoin Wallet Address ("+walletAddress+"): " + body,
                            details: body

                        }
                    }
                }
                else {
                    result = true;
                }
            }

            callback(result);
        });
    };

    var getWalletBalance = function(url, callback) {
        request.get(url, function(err, res, body){

            var result = {
                balance: 0
            };

            if (err  || !res || res.statusCode != 200) {
                result = {
                    balance: 0,
                    error: {
                        message:"Request for " + url+ " failed",
                        details: err
                    }
                };
            }
            else {
                var balance = Number(body);
                if (!body.length || !isFinite(balance)){
                    result = {
                        balance: 0,
                        error: {
                            message: "Invalid Litecoin Wallet Address ("+url+"): " + body,
                            details: body

                        }
                    }
                }
                else {
                    result = {
                        balance: balance,
                        error:false
                    };
                }
            }
            callback(result);
        });
    };

    self.getBalance= function(walletAddress, callback) {

        var result = {
            balance: 0,
            address: walletAddress
        };
        isValidAddress(walletAddress, function(validAddress){
            if (!validAddress) {
                result = validAddress;
            }
            else {
                getWalletBalance(self.getReceivedUrl(walletAddress), function(amountReceived){
                    if (amountReceived!=undefined&&(amountReceived.error==undefined||amountReceived.error==false)&& amountReceived.balance!=undefined && isFinite(amountReceived.balance)){
                        getWalletBalance(self.getSentUrl(walletAddress), function(amountSent){
                            if (amountSent!=undefined&&(amountSent.error==undefined||amountSent.error==false) && amountSent.balance!=undefined && isFinite(amountSent.balance)){
                                result.balance = amountReceived.balance - amountSent.balance;
                                result.error= false;
                                callback(result);
                            }
                            else {
                                callback(amountSent);
                            }
                        });

                    }
                    else {
                        callback(amountReceived);
                    }
                });

            }
        });
    };

}

module.exports = LitecoinBalance;