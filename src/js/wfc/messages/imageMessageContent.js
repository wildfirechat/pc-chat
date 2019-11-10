import MediaMessageContent from './mediaMessageContent';
import MessageContentMediaType from './messageContentMediaType';
import MessageContentType from './messageContentType';

export default class ImageMessageContent extends MediaMessageContent {
    // base64 encoded, 不包含头部:data:image/png;base64,
    thumbnail;

    constructor(file, thumbnail) {
        super(MessageContentType.Image, MessageContentMediaType.Image, file);
        this.thumbnail = thumbnail;
    }

    digest() {
        return '[图片]';
    }

    encode() {
        let payload = super.encode();
        payload.mediaType = MessageContentMediaType.Image;
        payload.binaryContent = this.thumbnail;
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.thumbnail = payload.binaryContent;
    }
}
