import MessageContent from "../messageContent";

export default class NotificationMessageContent extends MessageContent {
    // message#protoMessageToMessage时设置
    fromSelf = false;
    constructor(type) {
        super(type);
    }

    digest() {
        var desc = '';
        try {
            desc = this.formatNotification();
        } catch (error) {
            console.log('disgest', error);
        }
        return desc;
    };

    formatNotification() {
        return '..nofication..';
    }
}
