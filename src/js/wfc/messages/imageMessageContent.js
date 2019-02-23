import MediaMessageContent from './mediaMessageContent'
export default class ImageMessageContent extends MediaMessageContent{
    thumbnail;

    encode(){
        // TODO
    };

    decode(payload){
        super.decode(payload);
        this.thumbnail = payload.binaryContent;
    }
}
