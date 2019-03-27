import MessageContent from './messageContent'
export default class MediaMessageContent extends MessageContent {
    localPath = '';
    remotePath = '';

    constructor(type, file) {
        super(type);
        if (file) {
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
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.localPath = payload.localMediaPath;
        this.remotePath = payload.remoteMediaUrl;
    }
}
