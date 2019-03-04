import NotificationMessageContent from './notificationMessageContent'
export default class TipNotificationMessageContent extends NotificationMessageContent {
    tip = '';

    formatNotification() {
        return this.tip;
    }

    digest() {
        return this.tip;
    }

    encode() {
        let payload = super.encode();
        payload.content = this.tip;
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.content = payload.content;
    }
}