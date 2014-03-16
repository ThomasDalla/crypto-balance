'use strict';

// Load configurations
var ENCRYPTION_KEY = "ENCRYPTION_KEY";
if (process.env[ENCRYPTION_KEY] == undefined || !process.env[ENCRYPTION_KEY].length) {
    console.log("Please set the encryption key as environment variable " + ENCRYPTION_KEY);
} else {

    // Set the node enviornment variable if not set before
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';


    /**
     * Module dependencies.
     */
    var fs = require('fs'),
        path = require('path'),
        mongoose = require('mongoose'),
        config = require('./config/config'),
        MtGoxClient = require("./node_libs/mtgox/mtgox"),
        BitfinexClient = require("./node_libs/bitfinex/bfx"),
        CryptoCoinCharts = require("./node_libs/cryptocoincharts/cryptocoincharts"),
        YahooFinance = require("./node_libs/yahoofinance/yahoofinance"),
        GiveMeCoins = require("./node_libs/givemecoins/givemecoins"),
        BTCE = require("./node_libs/node-btce/btce"),
        BTER = require("./node_libs/bter/bter"),
        D7Pool = require("./node_libs/d7pool/d7pool"),
        YPool = require("./node_libs/ypool/ypool"),
        NvcKhoreClient = require("./node_libs/khore/khore"),
        MultiPoolClient = require("./node_libs/multipool/multipool"),
        BlockChainBalance = require("./node_libs/blockchain/blockchain"),
        LitecoinBalance = require("./node_libs/litecoin-explorer/litecoin-explorer"),
        BitcoinPriceIndex = require("./node_libs/bpi/bpi"),
        Secrets = require('./node_libs/secrets/secrets'),
        async = require("async"),
        _ = require('lodash');

    var INCLUDE_ZERO_VALUES = false;

    //console.log(config);
    //console.log(process.env);

    // Bootstrap db connection
    var db = mongoose.connect(config.db);

    // Bootstrap models
    var models_path = path.join(__dirname, './app/models');
    var walk = function(path) {
        fs.readdirSync(path).forEach(function(file) {
            var newPath = path + '/' + file;
            var stat = fs.statSync(newPath);
            if (stat.isFile()) {
                if (/(.*)\.(js$|coffee$)/.test(file)) {
                    require(newPath);
                }
            } else if (stat.isDirectory()) {
                walk(newPath);
            }
        });
    };
    walk(models_path);


    var User = mongoose.model('User'),
        UserAccount = mongoose.model('UserAccount'),
        BalanceSnapshot = mongoose.model('BalanceSnapshot');

    // get all users with enabled user accounts
    console.log('starting...');
    try {
        User.find().populate('accounts').exec(function(err, users) {
            console.log('Retrieved users');
            if (err) {
                console.log("Error querying the users: ");
                console.log(err);
            }
            var usersCount = users.length;
            console.log("Got " + usersCount + " users");
            var tasks = {};
            var pairsArray = ['btc_usd'];
            var pairsArray2 = [];
            var now = new Date();
            for (var u = 0; u < usersCount; u++) {
                (function() {
                    var user = users[u];
                    var errors = [];
                    tasks[user.username] = function(taskCallback) {
                        console.log("Retreiving balances for " + user.username);
                        //console.log(user);
                        try { // main function
                            UserAccount.find().where('user').equals(user).where('enabled').equals(true).sort('title').populate('user username _id', 'name username').populate('cryptosite').exec(function(err, useraccounts) {
                                if (err) {
                                    console.log("Error querying user accounts for user " + user.username);
                                    console.log(err);
                                } else {
                                    if (useraccounts.length > 0) {
                                        console.log(user.username + " has " + useraccounts.length + " account.");
                                        // got user accounts
                                        // go one by one and create balances object

                                        // Array to hold async tasks
                                        var asyncTasks = [];
                                        var allBalancesObj = {};
                                        var allBalancesDetails = {};

                                        var addBalance = function(_currency, _amount, _title) {
                                            _currency = _currency.toUpperCase();
                                            _amount = Number(_amount);
                                            if (isFinite(_amount) && (INCLUDE_ZERO_VALUES || _amount > 0)) {
                                                if (allBalancesObj[_currency] == undefined) {
                                                    allBalancesObj[_currency] = 0;
                                                }
                                                allBalancesObj[_currency] += _amount;
                                                if (allBalancesDetails[_currency] == undefined) {
                                                    allBalancesDetails[_currency] = [];
                                                }
                                                allBalancesDetails[_currency].push({
                                                    account: _title,
                                                    amount: _amount,
                                                    currency: _currency
                                                });
                                            }
                                        };

                                        var secrets = new Secrets();

                                        var useraccountsLength = useraccounts.length;
                                        for (var i = 0; i < useraccountsLength; i++) {
                                            if (!useraccounts[i].cryptosite.enabled) {
                                                errors.push({
                                                    message: "Skipped " + useraccounts[i].title + " because the site " + useraccounts[i].cryptosite.title + " is disabled",
                                                    details: useraccounts[i].cryptosite
                                                });
                                                continue;
                                            }
                                            (function() {
                                                var useraccount = useraccounts[i];

                                                // retrieve the cryptosite to find out if encrypted or not
                                                var apiKey = useraccount.apiKey;
                                                if (useraccount.cryptosite.apiKey.encrypt===true && apiKey.length>0) {
                                                    // decrypt the apiKey
                                                    apiKey = secrets.decrypt(apiKey, user.salt);
                                                }
                                                var apiSecret = useraccount.apiSecret;
                                                if (useraccount.cryptosite.apiSecret.encrypt===true && apiSecret.length>0) {
                                                    // decrypt the apiSecret
                                                    apiSecret = secrets.decrypt(apiSecret, user.salt);
                                                }
                                                var account = useraccount.title;
                                                var apiAccount = useraccount.apiAccount;
                                                if (useraccount.cryptosite.apiAccount.encrypt===true && apiAccount.length>0) {
                                                    // decrypt the account
                                                    apiAccount = secrets.decrypt(apiAccount, user.salt);
                                                }

                                                asyncTasks.push(function(bCallback) {
                                                    if (useraccount.cryptosite.title == 'MtGox') {
                                                        var _mtgoxClient = new MtGoxClient(apiKey, apiSecret);
                                                        _mtgoxClient.info(function(err, json) {
                                                            if (err) {
                                                                errors.push({
                                                                    message: "Error loading MtGox " + apiKey,
                                                                    details: err
                                                                });
                                                            } else {
                                                                var wallets = json.data['Wallets'];
                                                                var walletsKeys = Object.keys(wallets);
                                                                for (var j = 0; j < walletsKeys.length; j++) {
                                                                    var currency = walletsKeys[j];
                                                                    var balance = Number(wallets[currency]['Balance'].value) + Number(wallets[currency]['Open_Orders'].value);
                                                                    addBalance(currency, balance, account);
                                                                }
                                                            }
                                                            bCallback();
                                                        });
                                                    } else if (useraccount.cryptosite.title == 'Bitfinex') {
                                                        var bfx = new BitfinexClient(apiKey, apiSecret);
                                                        bfx.get_balances(function(response) {
                                                            //                                    allBalances.push(response);
                                                            if (response!==undefined && response.message === undefined) {
                                                                var bfxTotalBalance = {};
                                                                for (var l = 0; l < response.length; l++) {
                                                                    if (response[l].currency == undefined) {
                                                                        errors.push({
                                                                            message: 'invalid response from Bitfinex',
                                                                            details: response
                                                                        });
                                                                    } else {
                                                                        var currency = response[l].currency.toUpperCase();
                                                                        var balance = Number(response[l].amount);
                                                                        if (allBalancesObj[currency] == undefined) {
                                                                            allBalancesObj[currency] = 0;
                                                                        }
                                                                        allBalancesObj[currency] += balance;
                                                                        if (bfxTotalBalance[currency] == undefined) {
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
                                                                    addBalance(bfxCurrency, bfxBalance, account);
                                                                }
                                                            } else {
                                                                errors.push({
                                                                    message: response.message
                                                                });
                                                            }
                                                            bCallback();
                                                        });

                                                    } else if (useraccount.cryptosite.title == "Give Me Coins") {
                                                        var gmc = new GiveMeCoins();
                                                        gmc.getBalance(apiKey, function(gmcBalances) {
                                                            var gmcErrorsLength = gmcBalances.errors.length;
                                                            if (gmcErrorsLength > 0) {
                                                                for (var g = 0; g < gmcErrorsLength; g++) {
                                                                    errors.push(gmcBalances.errors[g]);
                                                                }
                                                            }
                                                            var gmcCurrenciesLength = gmcBalances.balances.length;
                                                            for (var m = 0; m < gmcCurrenciesLength; m++) {
                                                                var gmcBalance = gmcBalances.balances[m];
                                                                var gmcCcy = gmcBalance.currency;
                                                                var gmcAmount = gmcBalance.amount;
                                                                addBalance(gmcCcy.toUpperCase(), gmcAmount, account);
                                                            }
                                                            bCallback();
                                                        });
                                                    } else if (useraccount.cryptosite.title == "YPool") {
                                                        var ypool = new YPool();
                                                        ypool.getBalance(apiKey, function(ypoolBalances) {
                                                            var ypoolErrorsLength = ypoolBalances.errors.length;
                                                            if (ypoolErrorsLength > 0) {
                                                                for (var g = 0; g < ypoolErrorsLength; g++) {
                                                                    errors.push(ypoolBalances.errors[g]);
                                                                }
                                                            }
                                                            var ypoolCurrenciesLength = ypoolBalances.balances.length;
                                                            for (var m = 0; m < ypoolCurrenciesLength; m++) {
                                                                var ypoolBalance = ypoolBalances.balances[m];
                                                                var ypoolCcy = ypoolBalance.currency;
                                                                var ypoolAmount = ypoolBalance.amount;
                                                                addBalance(ypoolCcy.toUpperCase(), ypoolAmount, account);
                                                            }
                                                            bCallback();
                                                        });
                                                    } else if (useraccount.cryptosite.title == "BTC-E") {
                                                        var btce = new BTCE(apiKey, apiSecret);
                                                        btce.getInfo(function(err, btceData) {
                                                            if (btceData !=undefined &&  btceData.return !=undefined && btceData.return ['funds'] != undefined) {
                                                                var funds = btceData.return ['funds'];
                                                                var btceCurrencies = Object.keys(funds);
                                                                for (var btceI in btceCurrencies) {
                                                                    var btceCurrency = btceCurrencies[btceI].toUpperCase();
                                                                    var btceAmount = Number(funds[btceCurrencies[btceI]]);
                                                                    addBalance(btceCurrency, btceAmount, account);
                                                                }
                                                            } else {
                                                                errors.push({
                                                                    message: 'Unable to get data from BTC-E',
                                                                    details: err
                                                                });
                                                            }
                                                            bCallback();
                                                        });
                                                    } else if (useraccount.cryptosite.title == "Bter") {
                                                        var bter = new BTER(apiKey, apiSecret);
                                                        bter.getFunds(function(response) {
                                                            var bterFunds = response['available_funds'];
                                                            if (response.result == "true" && bterFunds != undefined) {
                                                                var bterCurrencies = Object.keys(bterFunds);
                                                                for (var bterIndex in bterCurrencies) {
                                                                    var bterCurrency = bterCurrencies[bterIndex].toUpperCase();
                                                                    var bterAmount = Number(response['available_funds'][bterCurrency]);
                                                                    addBalance(bterCurrency, bterAmount, account);
                                                                }
                                                            } else {
                                                                var msg = (response.message == undefined) ? "Error retrieving data from BTer" : response.message + " (Bter)";
                                                                errors.push({
                                                                    message: msg,
                                                                    details: response
                                                                });
                                                            }
                                                            bCallback();
                                                        });
                                                    } else if (useraccount.cryptosite.title == "D7 Pool") {
                                                        var d7pool = new D7Pool(apiKey);
                                                        d7pool.getStats(function(response) {
                                                            if (response.error == undefined && response.user) {
                                                                addBalance('PPC', Number(response.user['balance']), account);
                                                            } else {
                                                                errors.push({
                                                                    message: 'Error retrieving data from D7 Pool',
                                                                    details: response
                                                                });
                                                            }
                                                            bCallback();
                                                        });
                                                    } else if (useraccount.cryptosite.title == "NVC Khore") {
                                                        var nvcKhoreClient = new NvcKhoreClient(apiKey);
                                                        nvcKhoreClient.getStats(function(response) {
                                                            if (response.error == undefined && response['confirmed_rewards']) {
                                                                addBalance('NVC', Number(response['confirmed_rewards']), account);
                                                            } else {
                                                                errors.push({
                                                                    message: 'Error retrieving data from NVC Khore Pool',
                                                                    details: response
                                                                });
                                                            }
                                                            bCallback();
                                                        });
                                                    } else if (useraccount.cryptosite.title == "MultiPool") {
                                                        var multipoolClient = new MultiPoolClient(apiKey);
                                                        multipoolClient.getStats(apiKey, function(response) {
                                                            if (response.currency != undefined && !(response.currency.length == 0)) {
                                                                var multipoolCurrencies = Object.keys(response.currency);
                                                                for (var mp in multipoolCurrencies) {
                                                                    var mpCurrency = multipoolCurrencies[mp];
                                                                    var mpAmount = Number(response.currency[mpCurrency]['confirmed_rewards']);
                                                                    addBalance(mpCurrency, mpAmount, account);
                                                                }
                                                            } else {
                                                                errors.push({
                                                                    message: 'Error retrieving data from MultiPool',
                                                                    details: response
                                                                });
                                                            }
                                                            bCallback();
                                                        });
                                                    } else if (useraccount.cryptosite.title == "Bitcoin Wallet") {
                                                        var blockchainClient = new BlockChainBalance();
                                                        blockchainClient.getBalance(apiKey, function(response) {
                                                            if ((response.error === undefined || response.error === false) && response.balance !== undefined) {
                                                                addBalance('BTC', response.balance, account);
                                                            } else {
                                                                errors.push({
                                                                    message: 'Error retrieving data from BlockChain',
                                                                    details: response
                                                                });
                                                            }
                                                            bCallback();
                                                        });
                                                    } else if (useraccount.cryptosite.title == "Litecoin Wallet") {
                                                        var ltc = new LitecoinBalance();
                                                        ltc.getBalance(apiKey, function(response) {
                                                            if ((response.error === undefined || response.error === false) && response.balance !== undefined) {
                                                                addBalance('LTC', response.balance, account);
                                                            } else {
                                                                errors.push({
                                                                    message: 'Error retrieving data from Litecoin Explorer',
                                                                    details: response
                                                                });
                                                            }
                                                            bCallback();
                                                        });
                                                    } else {
                                                        errors.push({
                                                            message: "Unknown Site: " + useraccount.cryptosite.title
                                                        });
                                                        bCallback();
                                                    }
                                                });
                                            })();

                                        }

                                        async.series(asyncTasks, function() {
                                            // All tasks are done now, we can add the currencies to check for fx rates in the obj
                                            // - Get the BTC equivalent for each currency
                                            // - Get the total BTC equivalent
                                            // - Get the total USD equivalent
                                            var currencies = Object.keys(allBalancesObj);
                                            for (var k = 0; k < currencies.length; k++) {
                                                var currency = currencies[k];
                                                if (INCLUDE_ZERO_VALUES || allBalancesObj[currency] > 0) {
                                                    if (currency.toUpperCase() != "BTC") {
                                                        var cryptoCcy = currency.toLowerCase() + "_btc";
                                                        if (pairsArray.indexOf(cryptoCcy) === -1) {
                                                            pairsArray.push(cryptoCcy);
                                                        }
                                                    }
                                                    if (currency.toUpperCase() != "USD") {
                                                        var fiatCcy = "USD" + currency.toUpperCase();
                                                        if (pairsArray2.indexOf(fiatCcy) == -1) {
                                                            pairsArray2.push(fiatCcy);
                                                        }
                                                    }
                                                }
                                            }

                                            var cb = {
                                                allBalancesObj: allBalancesObj,
                                                allBalancesDetails: allBalancesDetails,
                                                user: user,
                                                errors: errors,
                                                currencies: currencies
                                            };
                                            console.log("Finished retrieving balances for user " + user.username);
                                            //console.log(cb);
                                            taskCallback(null, cb);

                                        });

                                    } else {
                                        console.log("No account for user " + user.username);
                                        console.log("calling taskCallback for " + user.username);
                                        //taskCallback(errors, false);
                                        var cb = {};
                                        cb[user.username] = {
                                            errors: errors
                                        };
                                        taskCallback(null, cb);
                                    }
                                }
                            });
                        } catch (er) {
                            errors.push({
                                message: "Error retreiving balances for user " + user.username,
                                details: er
                            });
                            console.log("calling taskCallback for " + user.username);
                            var cb = {};
                            cb[user.username] = {
                                errors: errors
                            };
                            taskCallback(null, cb);
                        }
                    };
                })();
            }

            console.log("Starting tasks in series");
            //console.log(tasks);
            async.series(tasks, function(errors, results) {
                console.log("Finished retreiving all balances for all user accounts... need to get FX and generate snapshot");
                //console.log(results);

                var saveTasks = [];

                var marketDataTasks = [];
                var cryptoPairs = [];
                var fiatPairs = [];
                var btcusd = 0;

                // Get the crypto market data
                marketDataTasks.push(function(cryptoCallback) {
                    var cryptoClient = new CryptoCoinCharts();
                    cryptoClient.getTradingPairs(pairsArray, function(responseTradingPairs) {
                        cryptoPairs = responseTradingPairs;
                        cryptoCallback();
                    });
                });

                // Get the fiat market data
                marketDataTasks.push(function(fiatCallback) {
                    var yqlClient = new YahooFinance();
                    yqlClient.getQuotes(pairsArray2, function(responseFiatPairs) {
                        fiatPairs = responseFiatPairs;
                        fiatCallback();
                    });
                });

                // Get the BTC USD from CoinDesk BPI
                marketDataTasks.push(function(bpiCallback) {
                    var coinDeskBpi = new BitcoinPriceIndex();
                    coinDeskBpi.getBpi(function(bpi) {
                        btcusd = bpi.bpi.USD.rate_float;
                        bpiCallback();
                    });
                });

                async.parallel(marketDataTasks, function() {

                    console.log("Finished retrieving market data (fx rates)");

                    var fxErrors = [];

                    // prepare the usdRate and btcRate object from market data
                    var usdRate = {
                        USD: 1.0
                    };
                    var btcRate = {
                        BTC: 1.0
                    };
                    var cryptoPairsLength = cryptoPairs.length;
                    var fiatPairsLength = fiatPairs.length;
                    if (cryptoPairsLength == 0 || cryptoPairsLength == undefined) {
                        fxErrors.push({
                            message: 'Error retrieving the crypto rates',
                            details: cryptoPairs
                        });
                    }
                    if (fiatPairsLength == 0 || fiatPairsLength == undefined) {
                        fxErrors.push({
                            message: 'Error retrieving the fiat rates',
                            details: fiatPairs
                        });
                    }
                    for (var cp = 0; cp < cryptoPairsLength; cp++) {
                        var cryptoPair = cryptoPairs[cp];
                        var cryptoRate = Number(cryptoPair['price_before_24h']);
                        if (isFinite(cryptoRate) && cryptoRate > 0) {
                            var cryptoPairCurrencies = cryptoPair.id.split('/');
                            var cryptoBaseCcy = cryptoPairCurrencies[0].toUpperCase();
                            var cryptoCounterCcy = cryptoPairCurrencies[1].toUpperCase();
                            if (cryptoCounterCcy == "USD") {
                                usdRate[cryptoBaseCcy] = cryptoRate;
                            } else if (fiatCounterCcy = "BTC") {
                                btcRate[cryptoBaseCcy] = cryptoRate;
                            }
                        } else {
                            fxErrors.push({
                                message: "Error analysing crypto price",
                                details: cryptoPair
                            });
                        }
                    }
                    var fxErrorsCount = fxErrors.length;
                    for (var fp = 0; fp < fiatPairsLength; fp++) {
                        var fiatPair = fiatPairs[fp];
                        var fiatRate = Number(fiatPair['Rate']);
                        if (isFinite(fiatRate) && fiatRate > 0) {
                            var fiatBaseCcy = fiatPair.id.substr(0, 3); // USD
                            var fiatCounterCcy = fiatPair.id.substr(3, 3); // foreign
                            if (fiatBaseCcy == "USD") {
                                usdRate[fiatCounterCcy] = 1.0 / fiatRate;
                            } else {
                                fxErrors.push({
                                    message: "Unable to deal with base ccy " + fiatBaseCcy,
                                    details: fiatPair
                                })
                            }
                        }
                    }

                    if (btcusd > 0){
                        usdRate['BTC'] = btcusd;
                    }

                    //console.log("Results:");
                    //console.log(results);
                    var usernames = Object.keys(results);
                    console.log(usernames);
                    var nbOfUsers = usernames.length;
                    for (var uIt = 0; uIt < nbOfUsers; uIt++) {
                        var currentUsername = usernames[uIt];
                        var currentUserResult = results[currentUsername];
                        var currencies = currentUserResult.currencies;
                        if (currencies!=undefined) {
                            var currentUser = currentUserResult.user;
                            var allBalancesObj = currentUserResult.allBalancesObj;
                            var allBalancesDetails = currentUserResult.allBalancesDetails;
                            var allBalances = [];
                            var currentErrors = [];
                            for (var eIt in currentUserResult.errors) {
                                currentErrors.push(currentUserResult.errors[eIt]);
                            }
                            for (var fxE = 0; fxE < fxErrorsCount; fxE++) {
                                currentErrors.push(fxErrors[fxE]);
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
                            for (var k = 0; k < currencies.length; k++) {
                                var currency = currencies[k];
                                if (INCLUDE_ZERO_VALUES || allBalancesObj[currency] > 0) {
                                    var btc_equivalent = -1.0;
                                    var usd_equivalent = -1.0;
                                    var balance = allBalancesObj[currency];
                                    var localBtcRate = 1.0;
                                    var localUsdRate = 1.0;
                                    if (btcRate[currency] != undefined) {
                                        btc_equivalent = balance * btcRate[currency];
                                        localBtcRate = btcRate[currency];
                                        usd_equivalent = btc_equivalent * usdRate.BTC;
                                        localUsdRate = btcRate[currency] * usdRate.BTC;
                                        totalBtc.from_crypto += btc_equivalent;
                                        totalUsd.from_crypto += usd_equivalent;
                                    }
                                    if (usdRate[currency] != undefined) {
                                        usd_equivalent = balance * usdRate[currency];
                                        localUsdRate = usdRate[currency];
                                        if (currency != 'BTC' && btcRate[currency] == undefined) {
                                            totalUsd.from_fiat += usd_equivalent;
                                        }
                                        if (btc_equivalent < 0) {
                                            btc_equivalent = usd_equivalent / usdRate['BTC'];
                                            localBtcRate = usdRate[currency] / usdRate['BTC'];
                                            totalBtc.from_fiat += btc_equivalent;
                                        }
                                    }
                                    totalBtc.amount += btc_equivalent;
                                    totalUsd.amount += usd_equivalent;
                                    var allBalancesDetailsCount = allBalancesDetails[currency].length;
                                    for (var abd = 0; abd < allBalancesDetailsCount; abd++) {
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
                            for (var ur = 0; ur < usdRatesLength; ur++) {
                                var ccy = usdRatesCurrencies[ur];
                                var usdRateObj = {
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
                            for (var br = 0; br < btcRatesLength; br++) {
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
                                balance_errors: currentErrors,
                                balances: allBalances,
                                rates: allRates,
                                timestamp: now,
                                summary: {
                                    BTC: totalBtc,
                                    USD: totalUsd
                                },
                                user: currentUser
                            };

                            var balanceSnapshot = new BalanceSnapshot(snap);
                            (function() {
                                var localErrors = currentErrors;
                                var localSnapshot = balanceSnapshot;
                                var localUsername = currentUsername;
                                saveTasks.push(function(saveTaskCallback) {
                                    localSnapshot.source = "worker";
                                    localSnapshot.save(function(err) {
                                        if (err) {
                                            //                                console.log(allBalances);
                                            console.log("Error saving to the DB: " + err);
                                            var errorO = {
                                                message: "Error saving to the DB",
                                                details: err
                                            };
                                            localErrors.push(errorO);
                                            localSnapshot.balance_errors.push(errorO);
                                        }
                                        console.log("Snapped balances for " + localUsername);
                                        if (localErrors.length) {
                                            console.log("\nErrors: ");
                                            console.log(localErrors);
                                        }
                                        console.log("Finished with user " + localUsername);
                                        saveTaskCallback(null, localSnapshot);
                                    });
                                });
                            })();
                        }
                    }

                    console.log("Starting to save in series to the DB");
                    async.series(saveTasks, function(errors, snapshots) {
                        console.log("Saved " + snapshots.length + " snapshots");
                        db.disconnect(function() {
                            console.log('disconnected baby!');
                            console.log('...finished!');
                        });
                    });
                });
            });
        });
    } catch (e) {
        console.log("An error occured: ");
        console.log(e);
    }
}
