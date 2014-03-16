var D7Pool = require('./d7pool');
var d7pool = new D7Pool('d1f8e4fcf8b258cbd249a25ad19a2a2e');
d7pool.getStats(function(response){
    console.log(response);
});