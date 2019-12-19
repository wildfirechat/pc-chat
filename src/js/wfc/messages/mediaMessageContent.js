import MessageContent from './messageContent'
export default class MediaMessageContent extends MessageContent {
    file;
    remotePath = '';
    localPath = '';
    mediaType = 0;

    constructor(messageType, mediaType = 0, fileOrLocalPath, remotePath) {
        super(messageType);
        this.mediaType = mediaType;
        if(typeof fileOrLocalPath === "string"){
          this.localPath = fileOrLocalPath;
          this.remotePath = remotePath;
        }else {
          this.file = fileOrLocalPath;
          if (fileOrLocalPath && fileOrLocalPath.path !== undefined) {
            this.localPath = fileOrLocalPath.path;
            // attention: 粘贴的时候，path是空字符串，故采用了这个trick
            if (this.localPath.indexOf(fileOrLocalPath.name) < 0) {
              this.localPath += fileOrLocalPath.name;
            }
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
