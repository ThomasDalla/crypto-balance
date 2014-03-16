var BlockChainBalance = require('./blockchain');
var blockchain = new BlockChainBalance();
blockchain.getBalance('wallet-address', function(response){
    console.log(response);
});