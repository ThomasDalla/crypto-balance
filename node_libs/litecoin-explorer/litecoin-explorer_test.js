var LitecoinBalance = require('./litecoin-explorer');
var ltc = new LitecoinBalance();
var w = 'wallet-address';
ltc.getBalance(w, function(response){
    console.log(response);
});
