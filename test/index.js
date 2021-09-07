'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Nock = require('nock');

const Validator = require('..');
const Mock = require('./mock');

const { it, describe, beforeEach } = exports.lab = Lab.script();
const expect = Code.expect;

describe('test validate() with promises', () => {

    beforeEach(() => {

        Nock(Mock.SigningCertHost)
            .get(Mock.SigningCertPath)
            .reply(200, Mock.pem);
    });

    it('succussfully validates HTTP/S Notification', () => {

        Validator.validate(Mock.validNotification)
            .then((payload) => {

                expect(payload).to.equal(Mock.validNotification);
            });
    });

    it('succussfully validates HTTP/S Notification with Subject', () => {

        Validator.validate(Mock.validNotificationWithSubject)
            .then((payload) => {

                expect(payload).to.equal(Mock.validNotificationWithSubject);
            });
    });

    it('succussfully validates HTTP/S SubscriptionConfirmation', () => {

        Validator.validate(Mock.validSubscriptionConfirmation)
            .then((payload) => {

                expect(payload).to.equal(Mock.validSubscriptionConfirmation);
            });
    });

    it('succussfully validates HTTP/S UnsubscribeConfirmation', () => {

        Validator.validate(Mock.validUnsubscribeConfirmation)
            .then((payload) => {

                expect(payload).to.equal(Mock.validUnsubscribeConfirmation);
            });
    });

    it('succussfully validates Lambda Notification with null Subject', () => {

        Validator.validate(Mock.validLambdaNotification)
            .then((payload) => {

                expect(payload).to.equal(Mock.validLambdaNotification);
            });
    });

    it('throws an error on invalid JSON', () => {

        Validator.validate('invalidJson')
            .catch((err) => {

                expect(err).to.be.error('Unexpected token i in JSON at position 0');
            });
    });

    it('throws an error on unsupported Type', () => {

        Validator.validate(Mock.invalidType)
            .catch((err) => {

                expect(err).to.be.error('Invalid Type');
            });
    });

    it('throws an error on unsupported SignatureVersion', () => {

        Validator.validate(Mock.invalidSignatureVersion)
            .catch((err) => {

                expect(err).to.be.error('Invalid SignatureVersion');
            });
    });

    it('throws an error on unsupported SigningCertURL', () => {

        Validator.validate(Mock.invalidSigningCertURL)
            .catch((err) => {

                expect(err).to.be.error('Invalid SigningCertURL');
            });
    });

    it('throws an error on invalid Signature', () => {

        Validator.validate(Mock.invalidSignature)
            .catch((err) => {

                expect(err).to.be.error('Invalid Signature');
            });
    });

    it('throws "Invalid Signature" when Crypo.verify throws an error', () => {

        Validator.validate(Mock.invalidSignatureNull)
            .catch((err) => {

                expect(err).to.be.error('Invalid Signature');
            });
    });
});

describe('test validate() with callbacks', () => {

    beforeEach(() => {

        Nock(Mock.SigningCertHost)
            .get(Mock.SigningCertPath)
            .reply(200, Mock.pem);
    });

    it('succussfully validates HTTP/S Notification', () => {

        Validator.validate(Mock.validNotification, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validNotification);
        });
    });

    it('succussfully validates HTTP/S Notification with Subject', () => {

        Validator.validate(Mock.validNotificationWithSubject, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validNotificationWithSubject);
        });
    });


    it('succussfully validates HTTP/S SubscriptionConfirmation', () => {

        Validator.validate(Mock.validSubscriptionConfirmation, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validSubscriptionConfirmation);
        });
    });

    it('succussfully validates HTTP/S UnsubscribeConfirmation', () => {

        Validator.validate(Mock.validUnsubscribeConfirmation, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validUnsubscribeConfirmation);
        });
    });

    it('succussfully validates Lambda Notification with null Subject', () => {

        Validator.validate(Mock.validLambdaNotification, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validLambdaNotification);
        });
    });

    it('throws an error on invalid JSON', () => {

        Validator.validate('invalidJson', (err) => {

            expect(err).to.be.error('Unexpected token i in JSON at position 0');
        });
    });

    it('throws an error on unsupported Type', () => {

        Validator.validate(Mock.invalidType, (err) => {

            expect(err).to.be.error('Invalid Type');
        });
    });

    it('throws an error on unsupported SignatureVersion', () => {

        Validator.validate(Mock.invalidSignatureVersion, (err) => {

            expect(err).to.be.error('Invalid SignatureVersion');
        });
    });

    it('throws an error on unsupported SigningCertURL', () => {

        Validator.validate(Mock.invalidSigningCertURL, (err) => {

            expect(err).to.be.error('Invalid SigningCertURL');
        });
    });

    it('throws an error on invalid Signature', () => {

        Validator.validate(Mock.invalidSignature, (err) => {

            expect(err).to.be.error('Invalid Signature');
        });
    });

    it('throws "Invalid Signature" when Crypo.verify throws an error', () => {

        Validator.validate(Mock.invalidSignatureNull, (err) => {

            expect(err).to.be.error('Invalid Signature');
        });
    });
});

// Using async/await and different .get(path) to handle flaky test coverage
describe('test getCert() error handling', () => {

    it('throws an error', async () => {

        Nock(Mock.SigningCertHost)
            .get(Mock.SigningCertPathError)
            .replyWithError('HTTPS Error');

        try {
            await Validator.validate(Mock.throwError);
        }
        catch (err) {
            expect(err).to.be.error('HTTPS Error');
        }
    });
});
