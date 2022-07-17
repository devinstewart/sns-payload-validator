/// <reference types="node" />

interface SnsPayload {
    Type: 'Notification' | 'SubscriptionConfirmation' | 'UnsubscribeConfirmation';
    MessageId: string;
    Token?: string;
    TopicArn: string;
    Subject?: string;
    Message: string;
    Timestamp: string;
    SignatureVersion: '1';
    Signature: string;
    SigningCertURL: string;
    SubscribeURL?: string;
    UnsubscribeURL?: string;
}
declare class Validator {

    /**
    * Validates an SNS payload and returns a Promise or passes it to the callback if provided.
    *
    * @param payload - The payload as a valid JSON string or Object sent in the HTTP/S body or Lambda event.
    * @param callback - Optional callback, if not passed a Promise is returned.
    * @returns If no callback is passed, a Promise is returned.
    */
    validate(payload: SnsPayload|String, callback?: (err: Error, payload: SnsPayload) => void): Promise<SnsPayload>;
}

declare const validator: Validator;
export = validator;