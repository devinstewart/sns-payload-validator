import { Agent } from 'https';

declare class SnsPayloadValidator {
    /**
    * Instantiates a SnsPayloadValidator object.
    */
    constructor(options?: SnsPayloadValidator.Configuration)

    /**
    * Validates an SNS payload and returns a Promise or passes it to the callback if provided.
    *
    * @param payload - The payload as a valid JSON string or Object sent in the HTTP/S body or Lambda event.
    * @param callback - Optional callback, if not passed a Promise is returned.
    * @returns If no callback is passed, a Promise is returned.
    */
    validate(payload: SnsPayloadValidator.SnsPayload|String, callback?: (err: Error, payload: SnsPayloadValidator.SnsPayload) => void): Promise<SnsPayloadValidator.SnsPayload>;
}

declare namespace SnsPayloadValidator {
    interface Configuration {
        /**
        * If true, the validator will cache the certificates it downloads from Amazon SNS using LRU Cache. Default: true.
        */
        useCache?: boolean;
        /**
        * The maximum number of certificates to cache. Must be positive integer. Default: 1000.
        * If the number of certificates exceeds this value, the least recently used certificate will be removed from the cache.
        */
        maxCerts?: number;

        /**
        * Optional https.Agent for downloading SigningCertURL
        */
        requestAgent?: Agent;
    }

    /**
    * The POST message of Amazon SNS values.
    */
    interface SnsPayload {
        /**
        * The type of message.
        */
        Type: 'Notification' | 'SubscriptionConfirmation' | 'UnsubscribeConfirmation';
        /**
        * A Universally Unique Identifier, unique for each message published.
        */
        MessageId: string;
        /**
        * A value you can use with the ConfirmSubscription action to confirm or re-confirm the subscription.
        */
        Token?: string;
        /**
        * The Amazon Resource Name (ARN) for the topic that this message was published to.
        */
        TopicArn: string;
        /**
        * The Subject parameter specified when the notification was published to the topic.
        */
        Subject?: string;
        /**
        * The Message value specified when the notification was published to the topic (Optional).
        */
        Message: string;
        /**
        * The time (GMT) when the notification was published.
        */
        Timestamp: string;
        /**
        * Version of the Amazon SNS signature used.
        */
        SignatureVersion: '1' | '2';
        /**
        * Base64-encoded SHA1withRSA or SHA256withRSA signature of the Message, MessageId, Subject (if present), Type, Timestamp, and TopicArn values.
        */
        Signature: string;
        /**
        * The URL to the certificate that was used to sign the message.
        */
        SigningCertURL: string;
        /**
        * The URL that you must visit in order to confirm or re-confirm the subscription.
        */
        SubscribeURL?: string;
        /**
        * A URL that you can use to unsubscribe the endpoint from this topic. If you visit this URL, Amazon SNS unsubscribes the endpoint and stops sending notifications to this endpoint.
        */
        UnsubscribeURL?: string;
    }
}

export = SnsPayloadValidator;

