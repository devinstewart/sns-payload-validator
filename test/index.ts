import * as Code from '@hapi/code';
import * as Nock from 'nock';

import * as Validator from '../lib';
const Mock = require('./mock');

const { expect } = Code;

Nock(Mock.SigningCertHost)
    .get(Mock.SigningCertPath)
    .reply(200, Mock.pem);


Validator.validate(Mock.validNotificationSv1)
    .then((payload: any) => {

        expect(payload).to.equal(Mock.validNotificationSv1);
    }).catch((err: any) => {

        expect(err).to.not.exist();
    });
