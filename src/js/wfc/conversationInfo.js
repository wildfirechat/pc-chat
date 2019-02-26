import Conversation from "./conversation";
import Message from "./messages/message";

export default class ConversationInfo{
    conversation = {};
    lastMessage = {};
    timestamp = 0;
    draft = '';
    unreadCount = {};
    isTop = false;
    isSilent = false;

    static protoConversationToConversationInfo(obj){
        let conversationInfo = Object.assign(new ConversationInfo(), obj);
        conversationInfo.conversation = new Conversation(obj.conversationType, obj.target, obj.line);
        conversationInfo.lastMessage = Message.protoMessageToMessage(obj.lastMessage);
        return conversationInfo;
    }
}