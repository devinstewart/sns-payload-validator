# AWS SNS Payload Validator
Node.js library that validates an AWS SNS payload of an HTTP/S POST or Lambda. The payload / error is then sent to either a Promise, or a callback if one is provided. Downloaded certificates can be cached.

[![Coverage Status](https://coveralls.io/repos/github/devinstewart/sns-payload-validator/badge.svg?branch=main)](https://coveralls.io/github/devinstewart/sns-payload-validator?branch=main)
[![GitHub Workflow Status](https://github.com/devinstewart/sns-payload-validator/actions/workflows/ci-plugin.yml/badge.svg?branch=main)](https://github.com/devinstewart/sns-payload-validator/actions?query=workflow%3Aci+branch%3Amain)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=devinstewart_sns-payload-validator&metric=sqale_rating)](https://sonarcloud.io/summary/overall?id=devinstewart_sns-payload-validator)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=devinstewart_sns-payload-validator&metric=security_rating)](https://sonarcloud.io/summary/overall?id=devinstewart_sns-payload-validator)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=devinstewart_sns-payload-validator&metric=reliability_rating)](https://sonarcloud.io/summary/overall?id=devinstewart_sns-payload-validator)
## Status and Testing
Check the [status](https://github.com/devinstewart/sns-tester/blob/main/status) of a message signed with `SignatureVersion` 1, or check the [status](https://github.com/devinstewart/sns-tester/blob/main/status-sigV2) of a message signed with `SignatureVersion` 2. This module is tested daily at 12:00 UTC on a live AWS account using SNS via the code found in the [sns-tester](https://github.com/devinstewart/sns-tester) repository.

**Please note:** While `SignatureVersion` 1 is the default, on 2022-09-19 [AWS announced](https://aws.amazon.com/blogs/security/sign-amazon-sns-messages-with-sha256-hashing-for-http-subscriptions/) the ability to set topics with `SignatureVersion` 2. Starting with version `1.1.0` of this module, `SignatureVersion` 1 and 2 are supported.
## Installing
Using npm:
```bash
$ npm install sns-payload-validator
```
Using yarn:
```bash
$ yarn add sns-payload-validator
```

## Getting started
The **AWS SNS Payload Validator** validates that the payload is from AWS SNS by validating the `Type`, `SignatureVersion`, `SigningCertURL` and `Signature`.  For more on this process please see [Verifying the signatures of Amazon SNS messages](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). A `Validator` object must be first be instantiated. The payload is the passed to the objects `validate` method. When instantiating, the [cache options](#cache-options) can be set.  In HTTP/S there are three ways to validate the message:
### async/await with try/catch
```javascript
const Validator = require('sns-payload-validator');
const validator = new Validator();

try {
    const validPayload = await validator.validate(payloadFromRequest)
    // validPayload has been validated and its signature checked
}
catch (err) {
    // payloadFromRequest could not be validated
}
```

### Promise Chaining
```javascript
const Validator = require('sns-payload-validator');
const validator = new Validator();

validator.validate(payloadFromRequest)
    .then((validPayload) => {
        // validPayload has been validated and its signature checked
    })
    .catch((err) => {
        // payloadFromRequest could not be validated
    });
```

### Callbacks
```javascript
const Validator = require('sns-payload-validator');
const validator = new Validator();

validator.validate(payloadFromRequest, (err, validPayload) => {
    if (err) {
        // payloadFromRequest could not be validated
        return;
    }

    // validPayload has been validated and its signature checked
});
```

### TypeScript
TypeScript is also supported by using:
```typescript
import * as Validator from 'sns-payload-validator';
```

If you want to use the `SnsPayload` interface, you can import it using:
```typescript
import { SnsPayload } from 'sns-payload-validator/interfaces';
```

### The Payload
AWS SNS sends HTTP/S POSTS with the Content-Type of `text/plain`.  Therefore, if there is a need to manipulate the payload before sending it to the AWS SNS Payload Validator, `JSON.parse()` must be used. AWS SNS Payload Validator accepts the payload as a valid JSON `string` or a JavaScript `Object`.  The return value is parsed into a JavaScript `Object`, so it is recommended to do any manipulation on the return value.

## Cache Options
The `Validator` object can be instantiated with the following cache options:
* `useCache`: `boolean` - If `true`, the validator will cache the certificates it downloads from Amazon SNS using [lru-cache](https://www.npmjs.com/package/lru-cache). Default: `true`.
* `maxCerts`: `number` - The maximum number of certificates to cache. Must be positive integer. Default: `1000`. If the number of certificates exceeds this value, the least recently used certificate will be removed from the cache.
```javascript
const Validator = require('sns-payload-validator');
const validator = new Validator({ useCache: true, maxCerts: 100 });
```
## Custom Request Agent
If a custom request agent is needed, it can be passed to the `Validator` object, which will be used when making requests to download the certificate.  This is useful if you are behind a proxy.  By default the `Validator` object uses the `https` module.
```javascript
const Validator = require('sns-payload-validator');
const validator = new Validator({ requestAgent: new ExternalProxyLib({ proxy: 'http://localhost:3000' }) });
```
## Examples with Types
Not to be confused with TypeScript, AWS SNS Messages start with a `Type` field.  The `Type` is one of three values: `Notification`, `SubscriptionConfirmation` or `UnsubscribeConfirmation`.
### Subscribe / Unsubscribe
If the endpoint should automaticaly subscribe when the a `SubscriptionConfirmation` is sent. **OR** if the endpoint should resubscribe if a `UnsubscribeConfirmation` is sent, the `SubscribeURL` can be used:
```javascript
const Validator = require('sns-payload-validator');
const Https = require('https')

const validator = new Validator();

try {
    const validPayload = await validator.validate(payloadFromRequest)
    if (validPayload.Type === 'SubscriptionConfirmation' || validPayload.Type === 'UnsubscribeConfirmation') {
        Https.get(validPayload.SubscribeURL, (res) => {
            // The route has been confirmed
            return;
        });
    }

    return;
}
catch (err) {
    console.log(err);
}
```

### Notifications
To act on a message published, a `Notification` is sent and the `Message` can be used:

```javascript
const Validator = require('sns-payload-validator');
const validator = new Validator();

try {
    const validPayload = await validator.validate(payloadFromRequest)
    if (validPayload.Type === 'Notification') {
        console.log('Here is the message:', validPayload.Message);
        return;
    }

    return;
}
catch (err) {
    console.log(err);
}
```

## Lambda
Validating the payload of the Lambda is similar:

```javascript
const Validator = require('sns-payload-validator');
const validator = new Validator();

exports.handler = async (event) => {
    const validPayload = await validator.validate(event.Records[0].Sns);
    console.log('Here is the message:', validPayload.Message);
    return;
}
```
Put the `await` inside a `try/catch` block if the Lambda should not error if validation fails.\
\
A few notes on Lambda:
* The payload is JavaScript `Object`.
* The keys of `SigningCertURL` and `UnsubscribeURL` are `SigningCertUrl` and `UnsubscribeUrl` respectivley.
* If a subject is not specified on publish the key of `Subject` is `null` as opposed to absent.

## Conclusion
See the [Amazon Simple Notification Service Developer Guide](https://docs.aws.amazon.com/sns/latest/dg/welcome.html) for more Documentation on AWS SNS.