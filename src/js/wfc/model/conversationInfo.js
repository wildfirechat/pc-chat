import Conversation from "./conversation";
import Message from "../messages/message";
import wfc from '../../stores/wfc'

import { ConversationType_Single, ConversationType_Group, ConversationType_Channel, ConversationType_ChatRoom } from "./conversationTypes";

export default class ConversationInfo {
    conversation = {};
    lastMessage = {};
    timestamp = 0;
    draft = '';
    unreadCount = {};
    isTop = false;
    isSilent = false;

    static protoConversationToConversationInfo(obj) {
        let conversationInfo = Object.assign(new ConversationInfo(), obj);
        conversationInfo.conversation = new Conversation(obj.conversationType, obj.target, obj.line);
        conversationInfo.lastMessage = Message.protoMessageToMessage(obj.lastMessage);
        return conversationInfo;
    }

    portrait() {
        let portrait = '';
        switch (this.conversation.conversationType) {
            case ConversationType_Single:
                let u = wfc.getUserInfo(this.conversation.target, false);
                portrait = u.portrait;
                break;
            case ConversationType_Group:
                // TODO
                break;
            case ConversationType_Channel:
                break;
            case ConversationType_ChatRoom:
                break;
            default:
                break;
        }

        return portrait;
    }

    title() {
        let targetName = this.conversation.target;
        let title = targetName;
        switch (this.conversation.conversationType) {
            case ConversationType_Single:
                let u = wfc.getUserInfo(this.conversation.target, false);
                targetName = u.displayName;
                break
            case ConversationType_Group:
                break
            case ConversationType_ChatRoom:
                break
            case ConversationType_Channel:
                break
            default:
                break;
        }

        title = targetName;
        return title;

    }
}