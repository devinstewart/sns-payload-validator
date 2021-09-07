'use strict';

exports.getKeys = (type) => {

    if (type === 'SubscriptionConfirmation' || type === 'UnsubscribeConfirmation') {
        // Support Both HTTP/S and Lambda Keys for SubscribeURL
        return ['Message', 'MessageId', 'SubscribeURL', 'SubscribeUrl', 'Timestamp', 'Token', 'TopicArn', 'Type'];
    }
    else if (type === 'Notification') {
        return ['Message', 'MessageId', 'Subject', 'Timestamp', 'TopicArn', 'Type'];
    }

    throw new Error('Invalid Type');

};
