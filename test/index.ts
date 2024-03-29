import * as Code from '@hapi/code';
import * as Nock from 'nock';

const Validator = require('../lib/index.js');
const Mock = require('./mock');

const { expect } = Code;

Nock(Mock.SigningCertHost)
    .get(Mock.SigningCertPath)
    .reply(200, Mock.pem);

const validator = new Validator();
validator.validate(Mock.validNotificationSv1)
    .then((payload: any) => {

        expect(payload).to.equal(Mock.validNotificationSv1);
    }).catch((err: any) => {

        expect(err).to.not.exist();
    });
