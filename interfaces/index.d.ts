export interface SnsPayload {
    Type: 'Notification' | 'SubscriptionConfirmation' | 'UnsubscribeConfirmation';
    MessageId: string;
    Token?: string;
    TopicArn: string;
    Subject?: string;
    Message: string;
    Timestamp: string;
    SignatureVersion: '1' | '2';
    Signature: string;
    SigningCertURL: string;
    SubscribeURL?: string;
    UnsubscribeURL?: string;
}