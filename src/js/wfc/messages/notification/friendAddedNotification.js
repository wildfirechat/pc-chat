/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import NotificationMessageContent from './notificationMessageContent'
import MessageContentType from '../messageContentType';
export default class FriendAddedNotification extends NotificationMessageContent {

    constructor() {
        super(MessageContentType.Friend_Added_Notification);
    }

    formatNotification() {
        return "您已经添加对方为好友了，可以愉快地聊天了";
    }

    digest() {
        return "您已经添加对方为好友了，可以愉快地聊天了";
    }

    encode() {
        let payload = super.encode();
        return payload;
    };

    decode(payload) {
        super.decode(payload);
    }
}
