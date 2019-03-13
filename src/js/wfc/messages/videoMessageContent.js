import MediaMessageContent from './mediaMessageContent'
import { ContentMediaType_Video } from './messageContentMediaTypes';
export default class VideoMessageContent extends MediaMessageContent {
    // base64 encoded
    thumbnail;

    digest() {
        return '[视频]';
    }

    encode() {
        let payload = super.encode();
        payload.mediaType = ContentMediaType_Video;
        payload.binaryContent = thumbnail;
    };

    decode(payload) {
        super.decode(payload);
        this.thumbnail = payload.binaryContent;
    }
}
