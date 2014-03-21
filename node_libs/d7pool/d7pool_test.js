var D7Pool = require('./d7pool');
var d7pool = new D7Pool('api-key');
d7pool.getStats(function(response){
    console.log(response);
});
