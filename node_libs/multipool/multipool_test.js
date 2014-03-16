var MultiPoolClient = require('./multipool');
var multipoolClient = new MultiPoolClient();
multipoolClient.getStats('your-key', function(response){
    console.log(response);
});