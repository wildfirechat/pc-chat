import { ContentMediaType_File } from "./messageContentMediaTypes";
import MediaMessageContent from "./mediaMessageContent";

export default class FileMessageContent extends MediaMessageContent {
    name = '';
    size = 0;

    digest() {
        return '[文件]';
    }

    encode() {
        let payload = super.encode();
        payload.searchableContent = name;
        payload.mediaType = ContentMediaType_File;
        payload.content = size + '';
    };

    decode(payload) {
        super.decode(payload);
        this.name = payload.searchableContent;
        this.size = Number(payload.content);
    }

}