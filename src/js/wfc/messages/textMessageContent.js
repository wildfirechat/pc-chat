import MessageContent from './baseContent'
import MessagePayload from './messagePayload';
export default class TextMessageContent extends MessageContent{
    content;

    encode(){
        let payload = new MessagePayload();
        payload.searchableContent = this.content;
        payload.mentionedType = this.mentionedType;
        payload.mentionedTargets = this.mentionedTargets;
        return payload;
    };

    decode(payload){
        super.decode(payload);
        this.content = payload.searchableContent;
    }
}
