/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import Conversation from "./conversation";
import Message from "../messages/message";
import wfc from '../client/wfc'
import {eq} from '../util/longUtil'

import ConversationType from "./conversationType";

export default class ConversationInfo {
    conversation = {};
    lastMessage = {};
    timestamp = 0;
    draft = '';
    unreadCount = {};
    isTop = false;
    isSilent = false;

    // TODO cache, maybe userInfo, groupInfo
    target;

    static protoConversationToConversationInfo(obj) {
        let conversationInfo = Object.assign(new ConversationInfo(), obj);
        conversationInfo.conversation = new Conversation(obj.conversationType, obj.target, obj.line);
        conversationInfo.lastMessage = Message.fromProtoMessage(obj.lastMessage);
        return conversationInfo;
    }

    portrait() {
        let portrait = '';
        switch (this.conversation.type) {
            case ConversationType.Single:
                let u = wfc.getUserInfo(this.conversation.target, false);
                portrait = u.portrait;
                break;
            case ConversationType.Group:
                let g = wfc.getGroupInfo(this.conversation.target, false);
                portrait = g.portrait;
                break;
            case ConversationType.Channel:
                break;
            case ConversationType.ChatRoom:
                break;
            default:
                break;
        }

        return portrait;
    }

    title() {
        let targetName = this.conversation.target;
        switch (this.conversation.type) {
            case ConversationType.Single:
                targetName = wfc.getUserDisplayName(this.conversation.target);
                break;
            case ConversationType.Group:
                let g = wfc.getGroupInfo(this.conversation.target, false);
                targetName = g.name;
                break;
            case ConversationType.ChatRoom:
                break;
            case ConversationType.Channel:
                break;
            default:
                break;
        }

        return targetName;
    }

    static equals(info1, info2) {
        if (!info1 || !info2) {
            return false;
        }
        if (!info1.conversation.equal(info2.conversation)) {
            return false;
        }

        let unreadCount1 = info1.unreadCount;
        let unreadCount2 = info2.unreadCount;
        if (unreadCount1.unread !== unreadCount2.unread
            || unreadCount1.unreadMention !== unreadCount2.unreadMention
            || unreadCount1.unreadMentionAll !== unreadCount2.unreadMentionAll) {
            return false;
        }

        // 其他的应当都会反应在timestamp上
        return eq(info1.timestamp, info2.timestamp) && info1.draft === info2.draft;

    }
}
