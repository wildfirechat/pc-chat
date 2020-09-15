/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

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
    type = ConversationType.Single;
    conversationType = this.type; // 这行是为了做一个兼容处理
    target = '';
    line = 0;

    constructor(type, target, line) {
        this.type = type;
        this.conversationType = type;
        this.target = target;
        this.line = line;
    }

    equal(conversation) {
        return this.type === conversation.type
            && this.target === conversation.target
            && this.line === conversation.line;
    }
}
