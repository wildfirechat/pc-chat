import NotificationMessageContent from "./notificationMessageContent";

export default class ChatRoomWelcomeNotificationContent extends NotificationMessageContent {
    welcome;


    formatNotification(message) {
        return this.welcome;
    }

    encode() {
        return super.encode();
    }

    decode(payload) {
        super.decode(payload);
    }
}
