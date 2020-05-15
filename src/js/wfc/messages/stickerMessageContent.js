import MessageContentMediaType from "./messageContentMediaType";
import MediaMessageContent from "./mediaMessageContent";
import MessageContentType from "./messageContentType";
import wfc from "../client/wfc"


export default class StickerMessageContent extends MediaMessageContent {
    width = 0;
    height = 0;
    constructor(filerOrLocalPath, remotePath, width, height) {
        super(MessageContentType.Sticker, MessageContentMediaType.Sticker, filerOrLocalPath, remotePath);
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
        };
        payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj));
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        let obj = JSON.parse(wfc.b64_to_utf8(payload.binaryContent));
        this.width = obj.x;
        this.height = obj.y;
    }
}
