import { ContentMediaType_File } from "./messageContentMediaTypes";
import MediaMessageContent from "./mediaMessageContent";

export default class StickerMessageContent extends MediaMessageContent {
    width = 0;
    height = 0;

    digest() {
        return '[表情]';
    }

    encode() {
        let payload = super.encode();
        payload.mediaType = ContentMediaType_File;
        let obj = {
            x: this.width,
            y: this.height,
        }
        payload.binaryContent = btoa(JSON.stringify(obj));
    };

    decode(payload) {
        super.decode(payload);
        let obj = JSON.parse(atob(payload.binaryContent));
        this.width = obj.x;
        this.height = obj.y;
    }
}