import MessageContent from "../messageContent";

export default class NotificationMessageContent extends MessageContent {
    // message#protoMessageToMessage时设置
    fromSelf = false;

    digest() {
        return this.formatNotification();
    };

    formatNotification() {
        return '..nofication..';
    }
}
