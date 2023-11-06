'use strict';

const Forge = require('node-forge');
const Crypto = require('crypto');
const Keys = require('../lib/keys');

// Create mock certificate
const pair = Forge.pki.rsa.generateKeyPair(2048);
const now = new Date();
const cert = Forge.pki.createCertificate();
cert.publicKey = pair.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = now;
cert.validity.notAfter = now;
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
cert.setSubject([{ name: 'commonName', value: 'http://example.com' }]);
cert.sign(pair.privateKey);
const privateKeyPem = Forge.pki.privateKeyToPem(pair.privateKey);

const internals = {};

// Function to Add Signature to valid payloads with private key used in certificate
internals.addSignature = (payload, signatureVersion = '1') => {

    const sign = signatureVersion === '1' ? Crypto.createSign('sha1WithRSAEncryption') : Crypto.createSign('sha256WithRSAEncryption');
    const keys = Keys.getKeys(payload.Type);
    for (const key of keys) {
        // If Subject is not given, Lambda sets it to null, but is not used in the Signature
        if (key === 'Subject' && payload[key] === null) {
            continue;
        }

        if (key in payload) {
            sign.write(`${key}\n${payload[key]}\n`);
        }
    }

    sign.end();

    payload.Signature = sign.sign(privateKeyPem, 'base64');

    return payload;
};

internals.MessageId = 'edeb3e00-ad32-5092-abe9-67ad99b82fdc';
internals.TopicArn = 'arn:aws:sns:us-east-1:012345678910:test';
internals.SigningCertHost = 'https://sns.us-east-1.amazonaws.com';
internals.SigningCertPath = '/SimpleNotificationService-0123456789abcdef0123456789abcdef.pem';
internals.SigningCertURL = internals.SigningCertHost + internals.SigningCertPath;
internals.SubscribeHost = 'https://sns.us-east-1.amazonaws.com';
internals.SubscribePath = '/';
internals.SubscribeQueryParams = { Action: 'ConfirmSubscription', MoreStuff: 'MoreStuff' };
internals.SubscribeURL = internals.SubscribeHost + internals.SubscribePath + '?Action=' + internals.SubscribeQueryParams.Action + '&MoreStuff=' + internals.SubscribeQueryParams.MoreStuff;

internals.validNotificationSv1 = {
    Type: 'Notification',
    MessageId: internals.MessageId,
    TopicArn: internals.TopicArn,
    Message: 'Hello SNS SignatureVersion 1!',
    Timestamp: (new Date()).toISOString(),
    SignatureVersion: '1',
    SigningCertURL: internals.SigningCertURL
};

internals.validNotificationSv2 = {
    Type: 'Notification',
    MessageId: internals.MessageId,
    TopicArn: internals.TopicArn,
    Message: 'Hello SNS SignatureVersion 2!',
    Timestamp: (new Date()).toISOString(),
    SignatureVersion: '2',
    SigningCertURL: internals.SigningCertURL
};

internals.validNotificationWithSubject = {
    Type: 'Notification',
    MessageId: internals.MessageId,
    TopicArn: internals.TopicArn,
    Subject: 'Regarding SNS',
    Message: 'Hello SNS!',
    Timestamp: (new Date()).toISOString(),
    SignatureVersion: '1',
    SigningCertURL: internals.SigningCertURL
};

internals.validSubscriptionConfirmation = {
    Type: 'SubscriptionConfirmation',
    MessageId: internals.MessageId,
    Token: '0123456789abcdef',
    TopicArn: internals.TopicArn,
    Message: 'You have chosen to subscribe to the topic...',
    SubscribeURL: internals.SubscribeURL,
    Timestamp: (new Date()).toISOString(),
    SignatureVersion: '1',
    SigningCertURL: internals.SigningCertURL
};

internals.validUnsubscribeConfirmation = {
    Type: 'UnsubscribeConfirmation',
    MessageId: internals.MessageId,
    Token: '0123456789abcdef',
    TopicArn: internals.TopicArn,
    Message: 'You have chosen to deactivate subscription...',
    SubscribeURL: internals.SubscribeURL,
    Timestamp: (new Date()).toISOString(),
    SignatureVersion: '1',
    SigningCertURL: internals.SigningCertURL
};

internals.validLambdaNotification = {
    Type: 'Notification',
    MessageId: internals.MessageId,
    TopicArn: internals.TopicArn,
    Subject: null,
    Message: 'Hello SNS!',
    Timestamp: (new Date()).toISOString(),
    SignatureVersion: '1',
    SigningCertUrl: internals.SigningCertURL
};

internals.Mock = class {

    pem = Forge.pki.certificateToPem(cert);
    SigningCertHost = internals.SigningCertHost;
    SigningCertPath = internals.SigningCertPath;
    SubscribeHost = internals.SubscribeHost;
    SubscribePath = internals.SubscribePath;
    SubscribeQueryParams = internals.SubscribeQueryParams;
    SigningCertPathError = '/SimpleNotificationService-0123456789abcdef0123456789abcdee.pem';
    validNotificationSv1 = internals.addSignature(internals.validNotificationSv1);
    validNotificationSv2 = internals.addSignature(internals.validNotificationSv2, '2');
    validNotificationWithSubject = internals.addSignature(internals.validNotificationWithSubject);
    validSubscriptionConfirmation = internals.addSignature(internals.validSubscriptionConfirmation);
    validUnsubscribeConfirmation = internals.addSignature(internals.validUnsubscribeConfirmation);
    validLambdaNotification = internals.addSignature(internals.validLambdaNotification);

    invalidSignatureVersion = {
        Type: 'Notification',
        MessageId: internals.MessageId,
        TopicArn: internals.TopicArn,
        Message: 'Hello SNS!',
        Timestamp: (new Date()).toISOString(),
        SignatureVersion: '3',
        SigningCertUrl: internals.SigningCertURL
    };

    invalidType = {
        Type: 'Invalid',
        MessageId: internals.MessageId,
        TopicArn: internals.TopicArn,
        Message: 'Hello SNS!',
        Timestamp: (new Date()).toISOString(),
        SignatureVersion: '1',
        SigningCertUrl: internals.SigningCertURL
    };

    invalidSigningCertURL = {
        Type: 'Notification',
        MessageId: internals.MessageId,
        TopicArn: internals.TopicArn,
        Message: 'Hello SNS!',
        Timestamp: (new Date()).toISOString(),
        SignatureVersion: '1',
        SigningCertURL: 'https://badactor.com/SimpleNotificationService-0123456789abcdef0123456789abcdef.pem'
    };

    invalidSignature = {
        Type: 'Notification',
        MessageId: internals.MessageId,
        TopicArn: internals.TopicArn,
        Message: 'Hello SNS!',
        Timestamp: (new Date()).toISOString(),
        Signature: 'SGVsbG8gU05TIQo=',
        SignatureVersion: '1',
        SigningCertUrl: internals.SigningCertURL
    };

    invalidSignatureNull = {
        Type: 'Notification',
        MessageId: internals.MessageId,
        TopicArn: internals.TopicArn,
        Message: 'Hello SNS!',
        Timestamp: (new Date()).toISOString(),
        Signature: null,
        SignatureVersion: '1',
        SigningCertUrl: internals.SigningCertURL
    };

    throwError = {
        Type: 'Notification',
        MessageId: internals.MessageId,
        TopicArn: internals.TopicArn,
        Message: 'Hello SNS!',
        Timestamp: (new Date()).toISOString(),
        SignatureVersion: '1',
        SigningCertURL: this.SigningCertHost + this.SigningCertPathError
    };
};

module.exports = new internals.Mock();
