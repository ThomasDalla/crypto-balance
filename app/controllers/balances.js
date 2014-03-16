/**
 * Created by dallagt on 24/01/14.
 */

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    config = require('../../config/config'),
    UserAccount = mongoose.model('UserAccount'),
    BalanceSnapshot = mongoose.model('BalanceSnapshot'),
    _ = require('lodash'),
    MtGoxClient = require("../../node_libs/mtgox/mtgox"),
    BitfinexClient = require("../../node_libs/bitfinex/bfx"),
    CryptoCoinCharts = require("../../node_libs/cryptocoincharts/cryptocoincharts"),
    YahooFinance = require("../../node_libs/yahoofinance/yahoofinance"),
    GiveMeCoins = require("../../node_libs/givemecoins/givemecoins"),
    BTCE = require("../../node_libs/node-btce/btce"),
    BTER = require("../../node_libs/bter/bter"),
    D7Pool = require("../../node_libs/d7pool/d7pool"),
    YPool = require("../../node_libs/ypool/ypool"),
    NvcKhoreClient = require("../../node_libs/khore/khore"),
    MultiPoolClient = require("../../node_libs/multipool/multipool"),
    BlockChainBalance = require("../../node_libs/blockchain/blockchain"),
    async = require("async");

var INCLUDE_ZERO_VALUES = false;

exports.all = function(req, res) {

    UserAccount.find().where('user').equals(req.user).where('enabled').equals(true).sort('title').populate('user', 'name username').populate('cryptosite').exec(function(err, useraccounts) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            if (useraccounts.length>0){
                var now = new Date();
                // got user accounts
                // go one by one and create balances object

                // Array to hold async tasks
                var asyncTasks = [];
                var allBalances = [];
                var errors = [];
                var allBalancesObj = {};
                var allBalancesDetails = {};

                var addBalance = function(_currency, _amount, _title) {
                    _currency = _currency.toUpperCase();
                    _amount = Number(_amount);
                    if (isFinite(_amount) && (INCLUDE_ZERO_VALUES ||_amount>0)){
                        if (allBalancesObj[_currency]==undefined){
                            allBalancesObj[_currency] = 0;
                        }
                        allBalancesObj[_currency] += _amount;
                        if (allBalancesDetails[_currency]==undefined){
                            allBalancesDetails[_currency] = [];
                        }
                        allBalancesDetails[_currency].push({
                            account: _title,
                            amount: _amount,
                            currency: _currency
                        });
                    }
                };

                var useraccountsLength = useraccounts.length;
                for (var i=0;i<useraccountsLength;i++){
                    var useraccount = useraccounts[i];
                    if (!useraccount.cryptosite.enabled){
                        errors.push({
                            message: "Skipped " + useraccount.title + " because the site " + useraccount.cryptosite.title + " is disabled",
                            details: useraccount.cryptosite
                        });
                        continue;
                    }
                    if (useraccount.cryptosite.title=='MtGox'){
                        (function() {
                            var mtgoxApiKey = useraccount.apiKey;
                            var mtgoxApiSecret = useraccount.apiSecret;
                            var mtgoxAccount = useraccount.title;
                            asyncTasks.push(
                                function(mtgoxCallback){
                                    var _mtgoxClient = new MtGoxClient(mtgoxApiKey, mtgoxApiSecret);
                                    _mtgoxClient.info(function(err, json) {
                                        if (err) {
                                            errors.push(
                                                {
                                                    message: "Error loading MtGox " + mtgoxApiKey,
                                                    details: err
                                                }
                                            );
                                        }
                                        else {
                                            var wallets = json.data['Wallets'];
                                            var walletsKeys = Object.keys(wallets);
                                            for(var j=0; j<walletsKeys.length; j++) {
                                                var currency = walletsKeys[j];
                                                var balance = Number(wallets[currency]['Balance'].value) + Number(wallets[currency]['Open_Orders'].value);
                                                allBalancesObj[currency] = (allBalancesObj[currency]==undefined?0:allBalancesObj[currency]) + balance;
                                                if (INCLUDE_ZERO_VALUES || balance>0){
                                                    if (allBalancesDetails[currency]==undefined){
                                                        allBalancesDetails[currency] = [];
                                                    }
                                                    allBalancesDetails[currency].push({
                                                        account: mtgoxAccount,
                                                        amount: balance,
                                                        currency: currency
                                                    });
                                                }
                                            }
                                        }
                                        mtgoxCallback();
                                    });
                                }
                            );
                        })();
                    }
                    else if (useraccount.cryptosite.title=='Bitfinex') {
                        (function(){
                            var bfxApiKey = useraccount.apiKey;
                            var bfxApiSecret = useraccount.apiSecret;
                            var bfxUserAccount = useraccount.title;
                            asyncTasks.push(
                                function(bfxCallback){
                                    var bfx = new BitfinexClient(bfxApiKey, bfxApiSecret);
                                    bfx.get_balances(function(response){
//                                    allBalances.push(response);
                                        if (response.message==undefined){
                                            var bfxTotalBalance = {};
                                            for (var l=0; l<response.length; l++){
                                                if (response[l].currency==undefined){
                                                    errors.push({
                                                        message: 'invalid response from Bitfinex',
                                                        details: response
                                                    });
                                                }
                                                else {
                                                    var currency = response[l].currency.toUpperCase();
                                                    var balance = Number(response[l].amount);
                                                    if (allBalancesObj[currency]==undefined){
                                                        allBalancesObj[currency] = 0;
                                                    }
                                                    allBalancesObj[currency] += balance;
                                                    if (bfxTotalBalance[currency]==undefined){
                                                        bfxTotalBalance[currency] = 0;
                                                    }
                                                    bfxTotalBalance[currency] += balance;
                                                }
                                            }
                                            // Now consolidate accounts (trading/exchange/margin)
                                            var bfxCurrencies = Object.keys(bfxTotalBalance);
                                            var bfxCurrenciesCount = bfxCurrencies.length;
                                            for (var bc = 0; bc < bfxCurrenciesCount; bc++) {
                                                var bfxCurrency = bfxCurrencies[bc];
                                                var bfxBalance = bfxTotalBalance[bfxCurrency];
                                                if (INCLUDE_ZERO_VALUES || bfxBalance > 0 )
                                                {
                                                    if (allBalancesDetails[bfxCurrency]==undefined){
                                                        allBalancesDetails[bfxCurrency] = [];
                                                    }
                                                    allBalancesDetails[bfxCurrency].push({
                                                        account: bfxUserAccount,
                                                        amount: bfxBalance,
                                                        currency: bfxCurrency
                                                    });

                                                }
                                            }
                                        }
                                        else {
                                            errors.push({
                                                message: response.message
                                            })
                                        }
                                        bfxCallback();
                                    });
                                }
                            );
                        })();
                    }
                    else if (useraccount.cryptosite.title == "Give Me Coins") {
                        (function(){
                            var gmcApiKey = useraccount.apiKey;
                            var gmcAccount = useraccount.title;
                            asyncTasks.push(function(gmcCallback) {
                                var gmc = new GiveMeCoins();
                                gmc.getBalance(gmcApiKey, function(gmcBalances) {
                                    var gmcErrorsLength = gmcBalances.errors.length;
                                    if (gmcErrorsLength>0){
                                        for (var g=0; g<gmcErrorsLength; g++){
                                            errors.push(gmcBalances.errors[g]);
                                        }
                                    }
                                    var gmcCurrenciesLength = gmcBalances.balances.length;
                                    for (var m=0; m<gmcCurrenciesLength; m++){
                                        var gmcBalance = gmcBalances.balances[m];
                                        var gmcCcy = gmcBalance.currency;
                                        var gmcAmount = gmcBalance.amount;
                                        if (allBalancesObj[gmcCcy.toUpperCase()]==undefined){
                                            allBalancesObj[gmcCcy.toUpperCase()] = 0;
                                        }
                                        allBalancesObj[gmcCcy] += gmcAmount;
                                        if (INCLUDE_ZERO_VALUES || gmcAmount > 0 )
                                        {
                                            if (allBalancesDetails[gmcCcy.toUpperCase()]==undefined){
                                                allBalancesDetails[gmcCcy.toUpperCase()] = [];
                                            }
                                            allBalancesDetails[gmcCcy.toUpperCase()].push({
                                                account: gmcAccount,
                                                amount: gmcAmount,
                                                currency: gmcCcy.toUpperCase()
                                            });

                                        }
                                    }
                                    gmcCallback();
                                });
                            });
                        })();
                    }
                    else if (useraccount.cryptosite.title == "YPool") {
                        (function(){
                            var ypoolApiKey = useraccount.apiKey;
                            var ypoolAccount = useraccount.title;
                            asyncTasks.push(function(ypoolCallback) {
                                var ypool = new YPool();
                                ypool.getBalance(ypoolApiKey, function(ypoolBalances) {
                                    var ypoolErrorsLength = ypoolBalances.errors.length;
                                    if (ypoolErrorsLength>0){
                                        for (var g=0; g<ypoolErrorsLength; g++){
                                            errors.push(ypoolBalances.errors[g]);
                                        }
                                    }
                                    var ypoolCurrenciesLength = ypoolBalances.balances.length;
                                    for (var m=0; m<ypoolCurrenciesLength; m++){
                                        var ypoolBalance = ypoolBalances.balances[m];
                                        var ypoolCcy = ypoolBalance.currency;
                                        var ypoolAmount = ypoolBalance.amount;
                                        if (allBalancesObj[ypoolCcy.toUpperCase()]==undefined){
                                            allBalancesObj[ypoolCcy.toUpperCase()] = 0;
                                        }
                                        allBalancesObj[ypoolCcy] += ypoolAmount;
                                        if (INCLUDE_ZERO_VALUES || ypoolAmount > 0 )
                                        {
                                            if (allBalancesDetails[ypoolCcy.toUpperCase()]==undefined){
                                                allBalancesDetails[ypoolCcy.toUpperCase()] = [];
                                            }
                                            allBalancesDetails[ypoolCcy].push({
                                                account: ypoolAccount,
                                                amount: ypoolAmount,
                                                currency: ypoolCcy.toUpperCase()
                                            });

                                        }
                                    }
                                    ypoolCallback();
                                });
                            });
                        })();
                    }
                    else if (useraccount.cryptosite.title == "BTC-E") {
                        (function(){
                            var btceApiKey = useraccount.apiKey;
                            var btceApiSecret = useraccount.apiSecret;
                            var btceAccount = useraccount.title;
                            asyncTasks.push(function(btceCallback) {
                                var btce = new BTCE(btceApiKey, btceApiSecret);
                                btce.getInfo(function(err, btceData) {
                                    if (btceData.return!=undefined && btceData.return.funds != undefined){
                                        var funds = btceData.return.funds;
                                        var btceCurrencies = Object.keys(funds);
                                        for (var btceI in btceCurrencies){
                                            var btceCurrency = btceCurrencies[btceI].toUpperCase();
                                            var btceAmount = Number(funds[btceCurrencies[btceI]]);
                                            addBalance(btceCurrency, btceAmount, btceAccount);
                                        }
                                    }
                                    else {
                                        errors.push({
                                            message: 'Unable to get data from BTC-E',
                                            details: btceData
                                        });
                                    }
                                    btceCallback();
                                });
                            });
                        })();
                    }
                    else if (useraccount.cryptosite.title == "Bter") {
                        (function(){
                            var bterApiKey = useraccount.apiKey;
                            var bterApiSecret = useraccount.apiSecret;
                            var bterAccount = useraccount.title;
                            asyncTasks.push(function(bterCallback) {
                                var bter = new BTER(bterApiKey, bterApiSecret);
                                bter.getFunds(function(response){
                                    var bterFunds = response['available_funds'];
                                    if (response.result=="true" && bterFunds!=undefined){
                                        var bterCurrencies = Object.keys(bterFunds);
                                        for (var bterIndex in bterCurrencies){
                                            var bterCurrency = bterCurrencies[bterIndex].toUpperCase();
                                            var bterAmount = Number(response['available_funds'][bterCurrency]);
                                            addBalance(bterCurrency, bterAmount, bterAccount);
                                        }
                                    }
                                    else {
                                        var msg = (response.message==undefined)
                                            ? "Error retrieving data from BTer"
                                            : response.message + " (Bter)";
                                        errors.push({
                                            message: msg,
                                            details: response
                                        });
                                    }
                                    bterCallback();
                                });
                            });
                        })();
                    }
                    else if (useraccount.cryptosite.title == "D7 Pool") {
                        (function(){
                            var d7ApiKey = useraccount.apiKey;
                            var d7Account = useraccount.title;
                            asyncTasks.push(function(d7Callback) {
                                var d7pool = new D7Pool(d7ApiKey);
                                d7pool.getStats(function(response){
                                    if (response.error==undefined && response.user) {
                                        addBalance('PPC', Number(response.user['balance']), d7Account);
                                    }
                                    else {
                                        errors.push({
                                            message: 'Error retrieving data from D7 Pool',
                                            details: response
                                        });
                                    }
                                    d7Callback();
                                });
                            });
                        })();
                    }
                    else if (useraccount.cryptosite.title == "NVC Khore") {
                        (function(){
                            var nvcKhoreApiKey = useraccount.apiKey;
                            var nvcKhoreAccount = useraccount.title;
                            asyncTasks.push(function(nvcKhoreCallback) {
                                var nvcKhoreClient = new NvcKhoreClient(nvcKhoreApiKey);
                                nvcKhoreClient.getStats(function(response){
                                    if (response.error==undefined && response['confirmed_rewards']) {
                                        addBalance('NVC', Number(response['confirmed_rewards']), nvcKhoreAccount);
                                    }
                                    else {
                                        errors.push({
                                            message: 'Error retrieving data from NVC Khore Pool',
                                            details: response
                                        });
                                    }
                                    nvcKhoreCallback();
                                });
                            });
                        })();
                    }
                    else if (useraccount.cryptosite.title == "MultiPool") {
                        (function(){
                            var multipoolApiKey = useraccount.apiKey;
                            var multipoolAccount = useraccount.title;
                            asyncTasks.push(function(multipoolCallback) {
                                var multipoolClient = new MultiPoolClient(multipoolApiKey);
                                multipoolClient.getStats(multipoolApiKey, function(response){
                                    if (response.currency!=undefined && !(response.currency.length==0)) {
                                        var multipoolCurrencies = Object.keys(response.currency);
                                        for (var mp in multipoolCurrencies){
                                            var mpCurrency = multipoolCurrencies[mp];
                                            var mpAmount = Number(response.currency[mpCurrency]['confirmed_rewards']);
                                            addBalance(mpCurrency, mpAmount, multipoolAccount);
                                        }
                                    }
                                    else {
                                        errors.push({
                                            message: 'Error retrieving data from MultiPool',
                                            details: response
                                        });
                                    }
                                    multipoolCallback();
                                });
                            });
                        })();
                    }
                    else if (useraccount.cryptosite.title == "Blockchain") {
                        (function(){
                            var blockchainWallet = useraccount.apiKey;
                            var blockchainAccount = useraccount.title;
                            asyncTasks.push(function(blockchainCallback) {
                                var blockchainClient = new BlockChainBalance();
                                blockchainClient.getBalance(blockchainWallet, function(response){
                                    if ((response.error === undefined || response.error === false)
                                        && response.balance !== undefined) {
                                        addBalance('BTC', response.balance, blockchainAccount);
                                    }
                                    else {
                                        errors.push({
                                            message: 'Error retrieving data from BlockChain',
                                            details: response
                                        });
                                    }
                                    blockchainCallback();
                                });
                            });
                        })();
                    }
                    else {
                        errors.push(
                            {
                                message: "Unknown Site: " + useraccount.cryptosite.title
                            }
                        );
                    }
                }

                async.parallel(asyncTasks, function(){
                    // All tasks are done now, we can return the object
                    // - Get the BTC equivalent for each currency
                    // - Get the total BTC equivalent
                    // - Get the total USD equivalent
                    var currencies = Object.keys(allBalancesObj);
                    var pairsArray = ['btc_usd'];
                    var pairsArray2 = [];
                    for (var k=0; k<currencies.length; k++) {
                        var currency = currencies[k];
                        if (INCLUDE_ZERO_VALUES || allBalancesObj[currency]>0)
                        {
                            if (currency.toUpperCase()!="BTC"){
                                pairsArray.push(currency.toLowerCase()+"_btc");
                            }
                            if (currency.toUpperCase()!="USD"){
                                pairsArray2.push("USD"+currency.toUpperCase());
                            }
                        }
                    }

                    var marketDataTasks = [];
                    var cryptoPairs = [];
                    var fiatPairs = [];

                    // Get the crypto market data
                    marketDataTasks.push(function(cryptoCallback) {
                        var cryptoClient = new CryptoCoinCharts();
                        cryptoClient.getTradingPairs(pairsArray, function(responseTradingPairs){
                            cryptoPairs = responseTradingPairs;
                            cryptoCallback();
                        });
                    });

                    // Get the fiat market data
                    marketDataTasks.push(function(fiatCallback) {
                        var yqlClient = new YahooFinance();
                        yqlClient.getQuotes(pairsArray2, function(responseFiatPairs){
                            fiatPairs = responseFiatPairs;
                            fiatCallback();
                        });
                    });

                    async.parallel(marketDataTasks, function() {

                        // prepare the usdRate and btcRate object from market data
                        var usdRate = {
                            USD: 1.0
                        };
                        var btcRate = {
                            BTC: 1.0
                        };
                        var cryptoPairsLength = cryptoPairs.length;
                        var fiatPairsLength = fiatPairs.length;
                        if (cryptoPairsLength==0 || cryptoPairsLength==undefined){
                            errors.push({
                                message: 'Error retrieving the crypto rates',
                                details: cryptoPairs
                            });
                        }
                        if (fiatPairsLength==0 || fiatPairsLength==undefined){
                            errors.push({
                                message: 'Error retrieving the fiat rates',
                                details: fiatPairs
                            });
                        }
                        for (var cp=0; cp<cryptoPairsLength; cp++){
                            var cryptoPair = cryptoPairs[cp];
                            var cryptoRate = Number(cryptoPair['price_before_24h']);
                            if (isFinite(cryptoRate) && cryptoRate > 0)
                            {
                                var cryptoPairCurrencies = cryptoPair.id.split('/');
                                var cryptoBaseCcy = cryptoPairCurrencies[0].toUpperCase();
                                var cryptoCounterCcy = cryptoPairCurrencies[1].toUpperCase();
                                if (cryptoCounterCcy == "USD") {
                                    usdRate[cryptoBaseCcy] = cryptoRate;
                                }
                                else if (fiatCounterCcy = "BTC") {
                                    btcRate[cryptoBaseCcy] = cryptoRate;
                                }
                            }
                            else {
                                errors.push({
                                    message: "Error analysing crypto price",
                                    details: cryptoPair
                                });
                            }
                        }
                        for (var fp=0; fp<fiatPairsLength; fp++){
                            var fiatPair = fiatPairs[fp];
                            var fiatRate = Number(fiatPair['Rate']);
                            if (isFinite(fiatRate) && fiatRate > 0){
                                var fiatBaseCcy = fiatPair.id.substr(0,3); // USD
                                var fiatCounterCcy = fiatPair.id.substr(3,3); // foreign
                                if (fiatBaseCcy == "USD") {
                                    usdRate[fiatCounterCcy] = 1.0/fiatRate;
                                }
                                else {
                                    errors.push({
                                        message: "Unable to deal with base ccy " + fiatBaseCcy,
                                        details: fiatPair
                                    })
                                }
                            }
//                            else {
//                                errors.push({
//                                    message: "Error analysing fiat price",
//                                    details: fiatPair
//                                });
//                            }
                        }

                        var totalBtc = {
                            currency: 'BTC',
                            from_crypto: 0,
                            from_fiat: 0,
                            amount: 0
                        };
                        var totalUsd = {
                            currency: 'USD',
                            from_crypto: 0,
                            from_fiat: 0,
                            amount: 0
                        };
                        for (var k=0; k<currencies.length; k++) {
                            var currency = currencies[k];
                            if (INCLUDE_ZERO_VALUES || allBalancesObj[currency]>0)
                            {
                                var btc_equivalent = -1.0;
                                var usd_equivalent = -1.0;
                                var balance = allBalancesObj[currency];
                                var localBtcRate = 1.0;
                                var localUsdRate = 1.0;
                                if (btcRate[currency]!=undefined){
                                    btc_equivalent = balance * btcRate[currency];
                                    localBtcRate = btcRate[currency];
                                    usd_equivalent = btc_equivalent * usdRate.BTC;
                                    localUsdRate = btcRate[currency] * usdRate.BTC;
                                    totalBtc.from_crypto += btc_equivalent;
                                    totalUsd.from_crypto += usd_equivalent;
                                }
                                if (usdRate[currency]!=undefined){
                                    usd_equivalent = balance * usdRate[currency];
                                    localUsdRate = usdRate[currency];
                                    if (currency!='BTC' && btcRate[currency]==undefined)
                                    {
                                        totalUsd.from_fiat += usd_equivalent;
                                    }
                                    if (btc_equivalent<0){
                                        btc_equivalent = usd_equivalent / usdRate['BTC'];
                                        localBtcRate = usdRate[currency] / usdRate['BTC'];
                                        totalBtc.from_fiat += btc_equivalent;
                                    }
                                }
                                totalBtc.amount += btc_equivalent;
                                totalUsd.amount += usd_equivalent;
                                var allBalancesDetailsCount = allBalancesDetails[currency].length;
                                for (var abd = 0; abd < allBalancesDetailsCount; abd++){
                                    allBalancesDetails[currency][abd].btc_equivalent = allBalancesDetails[currency][abd].amount * localBtcRate;
                                    allBalancesDetails[currency][abd].usd_equivalent = allBalancesDetails[currency][abd].amount * localUsdRate;
                                }
                                allBalances.push({
                                    currency: currency,
                                    amount: balance,
                                    btc_equivalent: btc_equivalent,
                                    usd_equivalent: usd_equivalent,
                                    details: allBalancesDetails[currency]
                                });
                            }
                        }
                        // Create an array from usdRate
                        var usdRatesCurrencies = Object.keys(usdRate);
                        var usdRatesLength = usdRatesCurrencies.length;
                        var usdRates = [];
                        var allRates = [];
                        for (var ur=0; ur<usdRatesLength; ur++){
                            var ccy = usdRatesCurrencies[ur];
                            var usdRateObj ={
                                    currency_from: ccy,
                                    currency_to: 'USD',
                                    value: usdRate[ccy]
                            };
                            usdRates.push(usdRateObj);
                            allRates.push(usdRateObj);
                        }
                        var btcRatesCurrencies = Object.keys(btcRate);
                        var btcRatesLength = btcRatesCurrencies.length;
                        var btcRates = [];
                        for (var br=0; br<btcRatesLength; br++){
                            var brCcy = btcRatesCurrencies[br];
                            var btcRateObj = {
                                currency_from: brCcy,
                                currency_to: 'BTC',
                                value: btcRate[brCcy]
                            };
                            btcRates.push(btcRateObj);
                            allRates.push(btcRateObj);
                        }
                        var snap = {
                            balance_errors: errors,
                            balances: allBalances,
                            rates: allRates,
                            timestamp: now,
                            summary: {
                                BTC: totalBtc,
                                USD: totalUsd
                            },
                            user: req.user
                        };

                        var balanceSnapshot = new BalanceSnapshot(snap);
                        balanceSnapshot.source = "adhoc";
                        balanceSnapshot.save(function(err) {
                            if (err) {
//                                console.log(allBalances);
                                console.log("Error saving to the DB: " + err);
                                var errorO = {
                                    message: err
                                };
                                errors.push(errorO);
                                balanceSnapshot.balance_errors.push(errorO);
                            }
                            res.jsonp(balanceSnapshot);
                        });

                    });

                });

            }
            else {
                res.jsonp([{
                    error: 'No account set'
                }]);
            }
        }
    });

};