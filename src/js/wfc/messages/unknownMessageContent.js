/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import MessageContent from "./messageContent";
import MessageContentType from "./messageContentType";

export default class UnknownMessageContent extends MessageContent {
    originalPayload;

    constructor(originalPayload) {
        super(MessageContentType.Unknown);
        this.originalPayload = originalPayload;
    }

    encode() {
        return this.originalPayload;
    }

    decode(paylaod) {
        this.originalPayload = paylaod;
    }

    digest() {
        return '未知类型消息';
    }
}