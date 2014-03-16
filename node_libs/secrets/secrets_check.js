var Secrets = require('./secrets');
var secrets = new Secrets();

var text = "this is a test with a much longer phrase to encode which can be up to like something very long, no even longer dude!" +
    "\nthis is a test with a much longer phrase to encode which can be up to like something very long, no even longer dude!";
var salt = "52e0a377c489c0bc14836ae9";

var encrypted = secrets.encrypt(text, salt);
console.log(encrypted);
var decrypted = secrets.decrypt(encrypted, salt);
console.log(decrypted);