var BTER = require('./bter');
var bter = new BTER('key', 'secret');
bter.getFunds(function(response){
    console.log(response);
});