import Conversation from "./conversation";
import Message from "../messages/message";
import Long from 'long';

export default class ConversationSearchResult {
    conversation;
    //only matchCount == 1, load the message
    matchMessage;
    timestamp;
    matchCount;

    static fromProtoConversationSearchResult(obj) {
        let conversationSearchResult = new ConversationSearchResult();
        conversationSearchResult.conversation = new Conversation(obj.conversationType, obj.target, obj.line)
        conversationSearchResult.matchCount = obj.marchedCount;
        if (obj.matchCount === 1) {
            conversationSearchResult.matchMessage = Message.fromProtoMessage(obj.marchedMessage);
        }
        conversationSearchResult.timestamp = Long.fromValue(obj.timestamp).toNumber();

        return conversationSearchResult;
    }
}