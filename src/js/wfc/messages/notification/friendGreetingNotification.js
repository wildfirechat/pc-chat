/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import NotificationMessageContent from './notificationMessageContent'
import MessageContentType from '../messageContentType';
export default class FriendGreetingNotification extends NotificationMessageContent {

    constructor() {
        super(MessageContentType.Friend_Greeting);
    }

    formatNotification() {
        return "以上是打招呼的内容";
    }

    digest() {
        return "以上是打招呼的内容";
    }

    encode() {
        let payload = super.encode();
        return payload;
    };

    decode(payload) {
        super.decode(payload);
    }
}
