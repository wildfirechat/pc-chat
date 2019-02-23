import MessageContent from './baseContent'
export default class MediaMessageContent extends MessageContent{
    localPath;
    remotePath;

    encode(){
        // TODO
    };

    decode(payload){
        super.decode(payload);
        this.localPath = payload.localMediaPath;
        this.remotePath = payload.remoteMediaUrl;
    }
}
