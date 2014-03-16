'use strict';


// Set the node enviornment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('../../config/config');
console.log(config.encryptionKey);


var ENCRYPTION_KEY = "ENCRYPTION_KEY";
if (process.env[ENCRYPTION_KEY]==undefined || !process.env[ENCRYPTION_KEY].length){
    console.log("Please set the encryption key as environment variable " + ENCRYPTION_KEY);
}

else {
    console.log("Yes we have a key!");

    var text = "this is a test with a much longer phrase to encode which can be up to like something very long, no even longer dude!this is a test with a much longer phrase to encode which can be up to like something very long, no even longer dude!";

    var crypto = require('crypto');


    var ecr = function(str, passphrase)
    {
        var cipher = crypto.createCipher('aes-256-cbc', passphrase);
        var cryptedBuffers = [cipher.update(new Buffer(str))];
        cryptedBuffers.push(cipher.final());
        var crypted = Buffer.concat(cryptedBuffers);
        return crypted.toString('hex');
    };
    var dcr = function(str, passphrase)
    {
        var dcipher = crypto.createDecipher('aes-256-cbc', passphrase);

        var dcryptedBuffers = [dcipher.update(new Buffer(str, 'hex'))];
        dcryptedBuffers.push(dcipher.final());
        var dcrypted = Buffer.concat(dcryptedBuffers)
            .toString('utf8');
        return dcrypted;
    };

    var encrypted = ecr(text, 'DscGrj2eGJUs9b0SIneehg==');
    console.log(encrypted);
    var decrypted = dcr(encrypted, 'DscGrj2eGJUs9b0SIneehg==');
    console.log(decrypted);



}
