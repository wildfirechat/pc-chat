import MessageContent from './messageContent'
import MessagePayload from './messagePayload';
export default class MediaMessageContent extends MessageContent {
    localPath;
    remotePath;

    encode() {
        let payload = new MessagePayload();
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
