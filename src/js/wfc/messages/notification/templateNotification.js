import NotificationMessageContent from './notificationMessageContent'
export default class TemplateNotification extends NotificationMessageContent {
    tip = '';

    constructor(tip) {
        this.tip = tip;
    }

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
        this.tip = payload.content;
    }
}