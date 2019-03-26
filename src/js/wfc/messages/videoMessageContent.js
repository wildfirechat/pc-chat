import MediaMessageContent from './mediaMessageContent'
import MessageContentMediaType from './messageContentMediaType';
import MessageContentType from './messageContentType';
import ThumbnailGenerator from 'video-thumbnail-generator';
import base64Img from 'base64-img'

export default class VideoMessageContent extends MediaMessageContent {
    // base64 encoded
    thumbnail;
    constructor(file) {
        super(MessageContentType.Video, file);
    }

    digest() {
        return '[视频]';
    }

    async encode() {
        let payload = super.encode();
        if (this.localPath) {
            let tg = new ThumbnailGenerator({
                sourcePath: payload.localMediaPath,
                thumbnailPath: '/tmp/',
                // tmpDir: '/some/writeable/directory' //only required if you can't write to /tmp/ and you need to generate gifs
            });
            let thumbnailFile = await tg.generateOneByPercent(0)
            var data = base64Img.base64Sync('/tmp/' + thumbnailFile);
            payload.binaryContent = data;
        }
        payload.mediaType = MessageContentMediaType.Video;
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        if (payload.binaryContent && payload.binaryContent.lenght > 0) {
            this.thumbnail = payload.binaryContent;
        }
    }
}
