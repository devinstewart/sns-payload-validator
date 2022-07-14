import * as Code from '@hapi/code';
import * as Nock from 'nock';

import * as Validator from '../lib';
const Mock = require('./mock');

const { expect } = Code;

Nock(Mock.SigningCertHost)
    .get(Mock.SigningCertPath)
    .reply(200, Mock.pem);


Validator.validate(Mock.validNotification)
    .then((payload: any) => {

        expect(payload).to.equal(Mock.validNotification);
    }).catch((err: any) => {

        expect(err).to.not.exist();
    });
