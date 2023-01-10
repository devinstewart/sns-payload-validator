'use strict';

const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const Nock = require('nock');

const Validator = require('..');
const Mock = require('./mock');

const { it, describe, beforeEach } = exports.lab = Lab.script();
const expect = Code.expect;

const setupMockBeforeEach = () => {

    beforeEach(() => {

        Nock(Mock.SigningCertHost)
            .get(Mock.SigningCertPath)
            .reply(200, Mock.pem);
    });
};

describe('test validate() with promises', () => {

    setupMockBeforeEach();

    it('succussfully validates HTTP/S Notification SignatureVersion 1', () => {

        const validator = new Validator();
        validator.validate(Mock.validNotificationSv1)
            .then((payload) => {

                expect(payload).to.equal(Mock.validNotificationSv1);
            }).catch((err) => {

                expect(err).to.not.exist();
            });
    });

    it('succussfully validates HTTP/S Notification SignatureVersion 2', () => {

        const validator = new Validator();
        validator.validate(Mock.validNotificationSv2)
            .then((payload) => {

                expect(payload).to.equal(Mock.validNotificationSv2);
            }).catch((err) => {

                expect(err).to.not.exist();
            });
    });

    it('succussfully validates HTTP/S Notification with Subject', () => {

        const validator = new Validator();
        validator.validate(Mock.validNotificationWithSubject)
            .then((payload) => {

                expect(payload).to.equal(Mock.validNotificationWithSubject);
            }).catch((err) => {

                expect(err).to.not.exist();
            });
    });

    it('succussfully validates HTTP/S SubscriptionConfirmation', () => {

        const validator = new Validator();
        validator.validate(Mock.validSubscriptionConfirmation)
            .then((payload) => {

                expect(payload).to.equal(Mock.validSubscriptionConfirmation);
            }).catch((err) => {

                expect(err).to.not.exist();
            });
    });

    it('succussfully validates HTTP/S UnsubscribeConfirmation', () => {

        const validator = new Validator();
        validator.validate(Mock.validUnsubscribeConfirmation)
            .then((payload) => {

                expect(payload).to.equal(Mock.validUnsubscribeConfirmation);
            }).catch((err) => {

                expect(err).to.not.exist();
            });
    });

    it('succussfully validates Lambda Notification with null Subject', () => {

        const validator = new Validator();
        validator.validate(Mock.validLambdaNotification)
            .then((payload) => {

                expect(payload).to.equal(Mock.validLambdaNotification);
            }).catch((err) => {

                expect(err).to.not.exist();
            });
    });

    it('throws an error on invalid JSON', () => {

        const validator = new Validator();
        validator.validate('invalidJson')
            .catch((err) => {

                expect(err).to.be.error('Payload is not a valid JSON string');
            });
    });

    it('throws an error on unsupported Type', () => {

        const validator = new Validator();
        validator.validate(Mock.invalidType)
            .catch((err) => {

                expect(err).to.be.error('Invalid Type');
            });
    });

    it('throws an error on unsupported SignatureVersion', () => {

        const validator = new Validator();
        validator.validate(Mock.invalidSignatureVersion)
            .catch((err) => {

                expect(err).to.be.error('Invalid SignatureVersion');
            });
    });

    it('throws an error on unsupported SigningCertURL', () => {

        const validator = new Validator();
        validator.validate(Mock.invalidSigningCertURL)
            .catch((err) => {

                expect(err).to.be.error('Invalid SigningCertURL');
            });
    });

    it('throws an error on invalid Signature', () => {

        const validator = new Validator();
        validator.validate(Mock.invalidSignature)
            .catch((err) => {

                expect(err).to.be.error('Invalid Signature');
            });
    });

    it('throws "Invalid Signature" when Crypo.verify throws an error', () => {

        const validator = new Validator();
        validator.validate(Mock.invalidSignatureNull)
            .catch((err) => {

                expect(err).to.be.error('Invalid Signature');
            });
    });
});

describe('test validate() with callbacks', () => {

    setupMockBeforeEach();

    it('succussfully validates HTTP/S Notification SignatureVersion 1', () => {

        const validator = new Validator();
        validator.validate(Mock.validNotificationSv1, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validNotificationSv1);
        });
    });

    it('succussfully validates HTTP/S Notification SignatureVersion 2', () => {

        const validator = new Validator();
        validator.validate(Mock.validNotificationSv2, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validNotificationSv2);
        });
    });

    it('succussfully validates HTTP/S Notification with Subject', () => {

        const validator = new Validator();
        validator.validate(Mock.validNotificationWithSubject, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validNotificationWithSubject);
        });
    });


    it('succussfully validates HTTP/S SubscriptionConfirmation', () => {

        const validator = new Validator();
        validator.validate(Mock.validSubscriptionConfirmation, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validSubscriptionConfirmation);
        });
    });

    it('succussfully validates HTTP/S UnsubscribeConfirmation', () => {

        const validator = new Validator();
        validator.validate(Mock.validUnsubscribeConfirmation, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validUnsubscribeConfirmation);
        });
    });

    it('succussfully validates Lambda Notification with null Subject', () => {

        const validator = new Validator();
        validator.validate(Mock.validLambdaNotification, (err, payload) => {

            if (err) {
                throw err;
            }

            expect(payload).to.equal(Mock.validLambdaNotification);
        });
    });

    it('throws an error on invalid JSON', () => {

        const validator = new Validator();
        validator.validate('invalidJson', (err) => {

            expect(err).to.be.error('Payload is not a valid JSON string');
        });
    });

    it('throws an error on unsupported Type', () => {

        const validator = new Validator();
        validator.validate(Mock.invalidType, (err) => {

            expect(err).to.be.error('Invalid Type');
        });
    });

    it('throws an error on unsupported SignatureVersion', () => {

        const validator = new Validator();
        validator.validate(Mock.invalidSignatureVersion, (err) => {

            expect(err).to.be.error('Invalid SignatureVersion');
        });
    });

    it('throws an error on unsupported SigningCertURL', () => {

        const validator = new Validator();
        validator.validate(Mock.invalidSigningCertURL, (err) => {

            expect(err).to.be.error('Invalid SigningCertURL');
        });
    });

    it('throws an error on invalid Signature', () => {

        const validator = new Validator();
        validator.validate(Mock.invalidSignature, (err) => {

            expect(err).to.be.error('Invalid Signature');
        });
    });

    it('throws "Invalid Signature" when Crypo.verify throws an error', () => {

        const validator = new Validator();
        validator.validate(Mock.invalidSignatureNull, (err) => {

            expect(err).to.be.error('Invalid Signature');
        });
    });
});

describe('test validate() with cache', () => {

    setupMockBeforeEach();

    it('succussfully gets puts item in cache', () => {

        const validator = new Validator();
        validator.validate(Mock.validNotificationSv1)
            .then(() => {

                const certCacheItem = validator.certCache.get(Mock.SigningCertHost + Mock.SigningCertPath);
                expect(certCacheItem).to.exist();
            }).catch((err) => {

                expect(err).to.not.exist();
            });
    });

    it('succussfully uses the cache on second call', () => {

        const validator = new Validator();
        validator.validate(Mock.validNotificationSv1)
            .then(() => {

                const certCacheItem = validator.certCache.get(Mock.SigningCertHost + Mock.SigningCertPath);
                expect(certCacheItem).to.exist();
                validator.validate(Mock.validNotificationSv1)
                    .then((payload) => {

                        expect(payload).to.equal(Mock.validNotificationSv1);
                    }).catch((err2) => {

                        expect(err2).to.not.exist();
                    });

            }).catch((err) => {

                expect(err).to.not.exist();
            });

    });
});

describe('test validate() without cache', () => {

    setupMockBeforeEach();

    it('succussfully gets puts item in cache', () => {

        const validator = new Validator({ useCache: false });
        validator.validate(Mock.validNotificationSv1)
            .then(() => {

                const certCache = validator.certCache;
                expect(certCache).to.not.exist();
            }).catch((err) => {

                expect(err).to.not.exist();
            });
    });
});

describe('test new Validator() error handling', () => {

    it('throws an error on invalid useCache', () => {

        expect(() => {

            new Validator({ useCache: 'invalid' });
        }).to.throw('useCache must be a boolean');
    });

    it('throws an error on invalid maxCerts type', () => {

        expect(() => {

            new Validator({ maxCerts: 'invalid' });
        }).to.throw('maxCerts must be a positive integer');
    });

    it('throws an error on invalid maxCerts value', () => {

        expect(() => {

            new Validator({ maxCerts: -1 });
        }).to.throw('maxCerts must be a positive integer');
    });
});

// Using async/await and different .get(path) to handle flaky test coverage
describe('test getCert() error handling', () => {

    it('throws an error', async () => {

        Nock(Mock.SigningCertHost)
            .get(Mock.SigningCertPathError)
            .replyWithError('HTTPS Error');

        const validator = new Validator();

        try {
            await validator.validate(Mock.throwError);
        }
        catch (err) {
            expect(err).to.be.error('HTTPS Error');
        }
    });
});
