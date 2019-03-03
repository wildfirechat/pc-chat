import MessageContent from "../messageContent";

export default class NotificationMessageContent extends MessageContent {
    fromSelf = false;

    formatNotification(){
        return null;
    }
}
