import MessageContent from './baseContent'
export default class TextMessageContent extends MessageContent{
    content;

    encode(){
        // TODO
    };

    decode(payload){
        super.decode(payload);
        this.content = payload.searchableContent;
    }
}
