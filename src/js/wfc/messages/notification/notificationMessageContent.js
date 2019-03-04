import MessageContent from "../messageContent";

export default class NotificationMessageContent extends MessageContent {
    // message#protoMessageToMessage时设置
    fromSelf = false;

    formatNotification() {
        return '..nofication..';
    }
}
