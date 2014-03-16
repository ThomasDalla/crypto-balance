var YPool = require('./ypool');
var ypoolClient = new YPool();
ypoolClient.getBalance('key', function(response){
    console.log(response);
});