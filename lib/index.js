'use strict';

const LRUCache = require('lru-cache');
const { get } = require('https');
const { createVerify } = require('crypto');

// Put getKeys(key) in own export so it can be used in testing
const { getKeys } = require('./keys');

const Validator = class {
    #keys = [];
    #certUrlPattern = /^https:\/\/sns\.[a-zA-Z0-9-]{3,}\.amazonaws\.com(\.cn)?\/SimpleNotificationService-[a-zA-Z0-9]{32}\.pem$/;

    constructor({ useCache = true, maxCerts = 1000, requestAgent } = {}) {

        if (typeof useCache !== 'boolean') {
            throw new Error('useCache must be a boolean');
        }

        if (Number.isInteger(maxCerts) === false || maxCerts < 1) {
            throw new Error('maxCerts must be a positive integer');
        }

        // Since libs like node-tunnel do not extend https.Agent directly, duck typing the requestAgent as https.Agent
        if (requestAgent && !requestAgent.requests) {
            throw new Error('requestAgent must be a valid https agent');
        }

        this.useCache = useCache;
        this.maxCerts = maxCerts;
        this.requestAgent = requestAgent;

        if (this.useCache) {
            this.certCache = new LRUCache({ max: this.maxCerts });
        }
    }

    #createVerifier = (payload) => {

        const verifier = payload.SignatureVersion === '1' ? createVerify('sha1WithRSAEncryption') : createVerify('sha256WithRSAEncryption');

        for (const key of this.#keys) {
            // If Subject is not given, Lambda sets it to null, but is not used in the Signature
            if (key === 'Subject' && payload[key] === null) {
                continue;
            }

            if (key in payload) {
                verifier.write(`${key}\n${payload[key]}\n`);
            }
        }

        verifier.end();

        return verifier;
    };

    #validateUrl = (url) => {

        return this.#certUrlPattern.test(url);
    };

    #verify = (payload, cert, verifier) => {

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

    #getCert = (url, requestOptions) => {

        return new Promise((resolve, reject) => {

            get(url, requestOptions, (res) => {

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

    #validateSigature = (payload, certCache, requestAgent) => {

        if (payload.SignatureVersion !== '1' && payload.SignatureVersion !== '2') {
            return Promise.reject(new Error('Invalid SignatureVersion'));
        }

        const verifier = this.#createVerifier(payload);

        // Support Both HTTP/S and Lambda Keys
        const certUrl = payload.SigningCertURL || payload.SigningCertUrl;

        if (!this.#validateUrl(certUrl)) {
            return Promise.reject(new Error('Invalid SigningCertURL'));
        }

        if (certCache) {
            const cert = certCache.get(certUrl);
            if (cert) {
                return this.#verify(payload, cert, verifier);
            }
        }

        const requestOptions = {};

        if (requestAgent) {
            requestOptions.agent = requestAgent;
        }

        return this.#getCert(certUrl, requestOptions).then((cert) => {

            if (certCache) {
                certCache.set(certUrl, cert);
            }

            return this.#verify(payload, cert, verifier);
        });
    };

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
            this.#keys = getKeys(payload.Type);
        }
        catch (err) {
            if (cb) {
                cb(err);
                return;
            }

            return Promise.reject(err);
        }

        payload = this.#validateSigature(payload, this.certCache, this.requestAgent);

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

module.exports = Validator;
