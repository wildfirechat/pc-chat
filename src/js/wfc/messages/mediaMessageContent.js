import MessageContent from './messageContent'
import MessageContentMediaType from './messageContentMediaType';
export default class MediaMessageContent extends MessageContent {
    file;
    remotePath = '';
    mediaType = 0;

    constructor(messageType, mediaType = 0, file) {
        super(messageType);
        this.mediaType = mediaType;
        this.file = file;
        if (file && file.path) {
            this.localPath = file.path;
            // attention: 粘贴的时候，path是空字符串，故采用了这个trick
            if (this.localPath.indexOf(file.name) < 0) {
                this.localPath += file.name;
            }
        }
    }

    encode() {
        let payload = super.encode();
        payload.localMediaPath = this.localPath;
        payload.remoteMediaUrl = this.remotePath;
        payload.mediaType = this.mediaType;
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.localPath = payload.localMediaPath;
        this.remotePath = payload.remoteMediaUrl;
        this.mediaType = payload.mediaType;
    }
}
