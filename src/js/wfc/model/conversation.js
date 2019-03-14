import ConversationType from "./conversationType";

/**
 * 
        "conversation":{
            "conversationType": 0, 
            "target": "UZUWUWuu", 
            "line": 0, 
        }
 */
export default class Conversation {
    conversationType = ConversationType.Single;
    target = '';
    line = 0;

    constructor(type, target, line) {
        this.conversationType = type;
        this.target = target;
        this.line = line;
    }

    equal(conversation) {
        return this.conversationType === conversation.conversationType
            && this.target === conversation.target
            && this.line === conversation.line;
    }
}