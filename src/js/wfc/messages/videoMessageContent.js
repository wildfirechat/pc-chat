import MediaMessageContent from './mediaMessageContent'
import MessageContentMediaType from './messageContentMediaType';
import MessageContentType from './messageContentType';

export default class VideoMessageContent extends MediaMessageContent {
    // base64 encoded
    thumbnail;
    constructor(file, thumbnail) {
        super(MessageContentType.Video, MessageContentMediaType.Video, file);
        this.thumbnail = thumbnail;
    }

    digest() {
        return '[视频]';
    }

    encode() {
        let payload = super.encode();
        payload.binaryContent = this.thumbnail;
        payload.mediaType = MessageContentMediaType.Video;
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        if (payload.binaryContent && payload.binaryContent.lenght > 0) {
            this.thumbnail = payload.binaryContent;
        }
    }
}
