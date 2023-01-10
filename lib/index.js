'use strict';

const Https = require('https');
const Crypto = require('crypto');
const LRUCache = require('lru-cache');

// Put getKeys(key) in own export so it can be used in testing
const Keys = require('./keys');

const internals = {
    keys: [],
    certUrlPattern: /^https:\/\/sns\.[a-zA-Z0-9-]{3,}\.amazonaws\.com(\.cn)?\/SimpleNotificationService-[a-zA-Z0-9]{32}\.pem$/
};

internals.getKeys = Keys.getKeys;

internals.getCert = (url) => {

    return new Promise((resolve, reject) => {

        Https.get(url, (res) => {

            let data = '';
            res.on('data', (d) => {

                data += d;
            });

            res.on('end', () => {

                resolve(data);
            });
        }).on('error', (err) => {

            reject(err);
        });
    });
};

internals.validateUrl = (url) => {

    return internals.certUrlPattern.test(url);
};

internals.validateSigature = (payload, certCache) => {

    if (payload.SignatureVersion !== '1' && payload.SignatureVersion !== '2') {
        return Promise.reject(new Error('Invalid SignatureVersion'));
    }

    const verifier = payload.SignatureVersion === '1' ? Crypto.createVerify('sha1WithRSAEncryption') : Crypto.createVerify('sha256WithRSAEncryption');

    for (const key of internals.keys) {
        // If Subject is not given, Lambda sets it to null, but is not used in the Signature
        if (key === 'Subject' && payload[key] === null) {
            continue;
        }

        if (key in payload) {
            verifier.write(`${key}\n${payload[key]}\n`);
        }
    }

    verifier.end();

    // Support Both HTTP/S and Lambda Keys
    const certUrl = payload.SigningCertURL || payload.SigningCertUrl;

    if (!internals.validateUrl(certUrl)) {
        return Promise.reject(new Error('Invalid SigningCertURL'));
    }

    if (certCache) {
        const cert = certCache.get(certUrl);
        if (cert) {
            return internals.verify(payload, cert, verifier);
        }
    }

    return internals.getCert(certUrl).then((cert) => {

        if (certCache) {
            certCache.set(certUrl, cert);
        }

        return internals.verify(payload, cert, verifier);
    });
};

internals.verify = (payload, cert, verifier) => {

    try {
        if (verifier.verify(cert, payload.Signature, 'base64')) {
            return Promise.resolve(payload);
        }

        return Promise.reject(new Error('Invalid Signature'));
    }
    catch {
        return Promise.reject(new Error('Invalid Signature'));
    }
};

internals.Validator = class {

    constructor({ useCache = true, maxCerts = 1000 } = {}) {

        if (typeof useCache !== 'boolean') {
            throw new Error('useCache must be a boolean');
        }

        if (Number.isInteger(maxCerts) === false || maxCerts < 1) {
            throw new Error('maxCerts must be a positive integer');
        }

        this.useCache = useCache;
        this.maxCerts = maxCerts;

        if (this.useCache) {
            this.certCache = new LRUCache({ max: this.maxCerts });
        }
    }

    validate = (payload, cb) => {

        if (typeof payload === 'string') {
            try {
                payload = JSON.parse(payload);
            }
            catch {
                const err = new Error('Payload is not a valid JSON string');
                if (cb) {
                    cb(err);
                    return;
                }

                return Promise.reject(err);
            }
        }

        try {
            internals.keys = internals.getKeys(payload.Type);
        }
        catch (err) {
            if (cb) {
                cb(err);
                return;
            }

            return Promise.reject(err);
        }

        payload = internals.validateSigature(payload, this.certCache);

        if (cb) {
            payload
                .then((results) => {

                    cb(null, results);
                })
                .catch((err) => {

                    cb(err);
                });
            return;
        }

        return payload;
    };
};

module.exports = internals.Validator;
