import MessageContent from "./messageContent";

export default class UnknownMessageContent extends MessageContent {
    originalPayload;

    encode() {
        return this.originalPayload;
    }

    decode(paylaod) {
        this.originalPayload = paylaod;
    }

    digest() {
        return '未知类型消息: ' + this.type;
    }
}