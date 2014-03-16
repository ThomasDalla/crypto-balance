'use strict';

var crypto = require('crypto');
// Set the node enviornment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('../../config/config');

function Secrets() {
    var self = this;
    self.passphrase = process.env[config.encryptionKey];
    var algorithm = 'aes-256-cbc';
    var signAlgorithm = 'sha256';

    var sign = function(text) {
            return crypto.createHmac(signAlgorithm, self.passphrase)
                .update(new Buffer(text, 'base64'))
                .digest('hex');
    };

    self.encrypt = function(text, salt){
        var cipher = crypto.createCipher(algorithm, sign(salt));
        var cryptedBuffers = [cipher.update(new Buffer(text))];
        cryptedBuffers.push(cipher.final());
        var crypted = Buffer.concat(cryptedBuffers);
        return crypted.toString('hex');
    };

    self.decrypt = function(text, salt) {
        var dcipher = crypto.createDecipher(algorithm, sign(salt));
        var dcryptedBuffers = [dcipher.update(new Buffer(text, 'hex'))];
        dcryptedBuffers.push(dcipher.final());
        return Buffer.concat(dcryptedBuffers).toString('utf8');
    };
}

module.exports = Secrets;