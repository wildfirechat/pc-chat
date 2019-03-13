import MediaMessageContent from './mediaMessageContent'
import { ContentMediaType_Voice } from './messageContentMediaTypes';
export default class SoundMessageContent extends MediaMessageContent {
    duration;

    digest() {
        return '[语音]';
    }

    encode() {
        let payload = super.encode();
        payload.mediaType = ContentMediaType_Voice;
        let obj = {
            duration: this.duration,
        }
        payload.content = JSON.stringify(obj);
    };

    decode(payload) {
        super.decode(payload);
        let obj = JSON.parse(payload.content);
        this.duration = obj.duration;
    }
}
