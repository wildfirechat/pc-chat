import MessageContentMediaType from "./messageContentMediaType";
import MediaMessageContent from "./mediaMessageContent";
import MessageContentType from "./messageContentType";

export default class FileMessageContent extends MediaMessageContent {
    name = '';
    size = 0;

    constructor(fileOrLocalPath, remotePath) {
        super(MessageContentType.File, MessageContentMediaType.File, fileOrLocalPath, remotePath);
        if (fileOrLocalPath instanceof File) {
            this.name = fileOrLocalPath.name;
            this.size = fileOrLocalPath.size;
        }
    }

    digest() {
        return '[文件]';
    }

    encode() {
        let payload = super.encode();
        payload.searchableContent = '[文件] ' + this.name;
        payload.content = this.size + '';
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.name = payload.searchableContent;
        this.size = Number(payload.content);
    }

}
