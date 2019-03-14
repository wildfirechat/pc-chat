import MessageContentMediaType from "./messageContentMediaType";
import MediaMessageContent from "./mediaMessageContent";
import MessageContentType from "./messageContentType";

export default class FileMessageContent extends MediaMessageContent {
    name = '';
    size = 0;

    constructor(name, size) {
        super(MessageContentType.File);
        this.name = name;
        this.size = size;
    }

    digest() {
        return '[文件]';
    }

    encode() {
        let payload = super.encode();
        payload.searchableContent = name;
        payload.mediaType = MessageContentMediaType.File;
        payload.content = size + '';
    };

    decode(payload) {
        super.decode(payload);
        this.name = payload.searchableContent;
        this.size = Number(payload.content);
    }

}