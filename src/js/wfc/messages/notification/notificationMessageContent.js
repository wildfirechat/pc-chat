import MessageContent from "../messageContent";

export default class NotificationMessageContent extends MessageContent {
    // message#protoMessageToMessage时设置
    fromSelf = false;
    constructor(type) {
        super(type);
    }

    digest(message) {
        var desc = '';
        try {
            desc = this.formatNotification(message);
        } catch (error) {
            console.log('disgest', error);
        }
        return desc;
    };

    formatNotification(message) {
        return '..nofication..';
    }
}
