import MediaMessageContent from './mediaMessageContent'
import MessageContentMediaType from './messageContentMediaType';
import MessageContentType from './messageContentType';
// import sharp from 'sharp'
export default class ImageMessageContent extends MediaMessageContent {
    // base64 encoded
    thumbnail;

    constructor(file) {
        super(MessageContentType.Image, file);
        if (file) {
            // TODO 
            // this.thumbnail = thumbnail;
            // sharp(file)
            //     .rotate()
            //     .resize(300)
            //     .toBuffer()
            //     .then(data => { this.thumbnail = data; console.log('image thumbnail', data) })
            //     .catch(err => { console.log('image thumbnail failed', err); });
        }
    }

    digest() {
        return '[图片]';
    }

    encode() {
        let payload = super.encode();
        payload.mediaType = MessageContentMediaType.Image;
        payload.binaryContent = btoa(this.thumbnail);
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.thumbnail = atob(payload.binaryContent);
    }

}
