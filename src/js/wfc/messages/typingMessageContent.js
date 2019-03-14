import MessageContent from "./messageContent";
import MessageContentType from "./messageContentType";

export default class TypingMessageContent extends MessageContent {

    static TYPING_TEXT = 0;
    static TYPING_VOICE = 1;
    static TYPING_CAMERA = 2;
    static TYPING_LOCATION = 3;
    static TYPING_FILE = 4;

    type = TYPING_TEXT;
    constructor(type) {
        super(MessageContentType.Typing);
        this.type = type;
    }

    digest() {
        return this.content;
    }

    encode() {
        let payload = super.encode();
        payload.searchableContent = this.content;
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.content = payload.searchableContent;
    }
}