import MessageContentMediaType from "./messageContentMediaType";
import MediaMessageContent from "./mediaMessageContent";
import MessageContentType from "./messageContentType";

export default class FileMessageContent extends MediaMessageContent {
    name = '';
    size = 0;
    static FILE_NAME_PREFIX = '[文件] ';

    constructor(fileOrLocalPath, remotePath) {
        super(MessageContentType.File, MessageContentMediaType.File, fileOrLocalPath, remotePath);
        if (typeof File !== 'undefined' && fileOrLocalPath instanceof File) {
            this.name = fileOrLocalPath.name;
            this.size = fileOrLocalPath.size;
        }
    }

    digest() {
        return '[文件]';
    }

    encode() {
        let payload = super.encode();
        payload.searchableContent = FileMessageContent.FILE_NAME_PREFIX + this.name;
        payload.content = this.size + '';
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        if(payload.searchableContent){
            if(payload.searchableContent.indexOf(FileMessageContent.FILE_NAME_PREFIX) === 0){
                this.name = payload.searchableContent.substring(payload.searchableContent.indexOf(FileMessageContent.FILE_NAME_PREFIX) + FileMessageContent.FILE_NAME_PREFIX.length);
            }else {
        this.name = payload.searchableContent;
            }
        this.size = Number(payload.content);
        }
    }

}
