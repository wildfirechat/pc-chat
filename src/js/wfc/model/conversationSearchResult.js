/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import Conversation from "./conversation";
import Message from "../messages/message";

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
        if (obj.marchedCount === 1) {
            conversationSearchResult.matchMessage = Message.fromProtoMessage(obj.marchedMessage);
        }
        conversationSearchResult.timestamp = Number(obj.timestamp);

        return conversationSearchResult;
    }
}
