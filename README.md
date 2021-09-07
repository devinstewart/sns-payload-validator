# AWS SNS Payload Validator
Node.js library that validates an AWS SNS payload of an HTTP/S POST or Lambda. The payload / error is then sent to either a Promise, or a callback if one is provided.

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
The **AWS SNS Payload Validator** validates that the payload is from AWS SNS by validating the `Type`, `SignatureVersion`, `SigningCertURL` and `Signature`.  For more on this process please see [Verifying the signatures of Amazon SNS messages](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html). In HTTP/S there are three ways to validate the message:

### async/await with try/catch
```javascript
const Validator = require('sns-payload-validator');

try {
    const validPayload = await Validator.validate(payloadFromRequest)
    // validPayload has been validated and its signature checked
}
catch (err) {
    // payloadFromRequest could not be validated
}
```

### Promise Chaining
```javascript
const Validator = require('sns-payload-validator');

Validator.validate(payloadFromRequest)
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

Validator.validate(payloadFromRequest, (err, validPayload) => {
    if (err) {
        // payloadFromRequest could not be validated
        return;
    }

    // validPayload has been validated and its signature checked
});
```

TypeScript is also supported by using: `import Valiadator from ('sns-payload-validator')`, then using any of the three methods above.\
\
AWS SNS sends HTTP/S POSTS with the Content-Type of `text/pain`.  Therefore, if there is a need to manipulate the payload before sending it to the AWS SNS Payload Validator, `JSON.parse()` must be used. AWS SNS Payload Validator excepts the payload as a valid JSON `string` or a JavaScript `Object`.  The return value is parsed into a JavaScript `Object`, so it is recommended to do any manipulation be done on the return value.

## Examples with Types

### Subscribe / Unsubscribe
If the endpoint should automaticaly subscribe when the a `SubscriptionConfirmation` is sent. **OR** if the endpoint should resubscribe if a `UnsubscribeConfirmation` is sent, the `SubscribeURL` can be used:
```javascript
const Validator = require('sns-payload-validator');
const Https = require('https')

try {
    const validPayload = await Validator.validate(payloadFromRequest)
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

try {
    const validPayload = await Validator.validate(payloadFromRequest)
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

exports.handler = async (event) => {
    const validPayload = await Validator.validate(event.Records[0].Sns);
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