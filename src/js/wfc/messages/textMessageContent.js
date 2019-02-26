import MessageContent from './baseContent'
import MessagePayload from './messagePayload';
import { ContentType_Text } from './messageTypes';
// fixme 下面这行，不知道为什么，会有问题，可能是因为循环import
// import { ContentType_Text } from '../messageConfig';
export default class TextMessageContent extends MessageContent{
    content;

    constructor(content, mentionedType = 0, mentionedTargets = []){
        super(ContentType_Text, mentionedType, mentionedTargets);
        this.content = content;
    }

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
