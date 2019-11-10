import MessageContentMediaType from "./messageContentMediaType";
import MediaMessageContent from "./mediaMessageContent";
import MessageContentType from "./messageContentType";

export default class FileMessageContent extends MediaMessageContent {
    name = '';
    size = 0;

    constructor(file) {
        super(MessageContentType.File, MessageContentMediaType.File, file);
        if (file) {
            this.name = file.name;
            this.size = file.size;
        }
    }

    digest() {
        return '[文件]';
    }

    encode() {
        let payload = super.encode();
        payload.searchableContent = this.name;
        payload.content = this.size + '';
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.name = payload.searchableContent;
        this.size = Number(payload.content);
    }

}
