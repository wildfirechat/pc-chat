import MediaMessageContent from './mediaMessageContent'
import MessageContentMediaType from './messageContentMediaType';
import MessageContentType from './messageContentType';
export default class SoundMessageContent extends MediaMessageContent {
    duration;
    constructor(file, duration) {
        super(MessageContentType.Voice, MessageContentMediaType.File, file);
        this.duration = duration;
    }

    digest() {
        return '[语音]';
    }

    encode() {
        let payload = super.encode();
        payload.mediaType = MessageContentMediaType.Voice;
        let obj = {
            duration: this.duration,
        }
        payload.content = JSON.stringify(obj);
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        let obj = JSON.parse(payload.content);
        this.duration = obj.duration;
    }
}
