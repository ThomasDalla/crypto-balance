var LitecoinBalance = require('./litecoin-explorer');
var ltc = new LitecoinBalance();
var w = 'wallet-address';
ltc.getBalance(w, function(response){
    console.log(response);
});
w='LVUKAoJjBTqR3UMQYrn2DZdSfWXSwLunDM';
ltc.getBalance(w, function(response){
    console.log(response);
});