import MessageContent from './messageContent'
import MessagePayload from './messagePayload';
export default class MediaMessageContent extends MessageContent {
    localPath = '';
    remotePath = '';

    constructor(type, file) {
        super(type);
        if (file) {
            this.localPath = file.path;
        }
    }

    encode() {
        let payload = super.encode();
        payload.localMediaPath = this.localPath;
        payload.remoteMediaUrl = this.remoteUrl;
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.localPath = payload.localMediaPath;
        this.remotePath = payload.remoteMediaUrl;
    }
}
