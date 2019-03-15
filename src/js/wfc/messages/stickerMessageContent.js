import MessageContentMediaType from "./messageContentMediaType";
import MediaMessageContent from "./mediaMessageContent";
import MessageContentType from "./messageContentType";

export default class StickerMessageContent extends MediaMessageContent {
    width = 0;
    height = 0;
    constructor(width, height) {
        super(MessageContentType.Sticker);
        this.width = width;
        this.height = height;
    }

    digest() {
        return '[表情]';
    }

    encode() {
        let payload = super.encode();
        payload.mediaType = MessageContentMediaType.File;
        let obj = {
            x: this.width,
            y: this.height,
        }
        payload.binaryContent = btoa(JSON.stringify(obj));
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        let obj = JSON.parse(atob(payload.binaryContent));
        this.width = obj.x;
        this.height = obj.y;
    }
}