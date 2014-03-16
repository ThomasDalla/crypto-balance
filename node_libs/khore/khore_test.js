var NvcKhoreClient = require('./khore');
var khoreClient = new NvcKhoreClient('key');
khoreClient.getStats(function(response){
    console.log(response);
});