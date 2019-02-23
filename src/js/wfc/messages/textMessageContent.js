import MessageContent from './baseContent'
export default class TextMessageContent extends MessageContent{
    content;

    encode(){
        // TODO
    };

    decode(content){
        super.decode(content);
        this.content = content.searchableContent;
    }
}
