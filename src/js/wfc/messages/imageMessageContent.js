import MediaMessageContent from './mediaMessageContent'
import MessageContentMediaType from './messageContentMediaType';
import MessageContentType from './messageContentType';
import { thumbnail } from "easyimage";
import base64Img from 'base64-img'

export default class ImageMessageContent extends MediaMessageContent {
    // base64 encoded
    thumbnail;

    constructor(file) {
        super(MessageContentType.Image, file);
    }

    digest() {
        return '[图片]';
    }

    async encode() {
        let payload = super.encode();
        payload.mediaType = MessageContentMediaType.Image;
        if (this.localPath) {
            const thumbnailInfo = await thumbnail({
                src: this.localPath,
                width: 320,
                height: 240,
            });
            var data = base64Img.base64Sync(thumbnailInfo.path);
            payload.binaryContent = data;
        }
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.thumbnail = payload.binaryContent;
    }
}
