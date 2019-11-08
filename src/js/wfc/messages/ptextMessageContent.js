import MessageContent from './messageContent'
import MessagePayload from './messagePayload';
import MessageContentType from './messageContentType';
import TextMessageContent from './textMessageContent';


// fixme 下面这行，不知道为什么，会有问题，可能是因为循环import
// import { ContentType.Text } from '../messageConfig';
export default class PTextMessageContent extends TextMessageContent {

    constructor(content, mentionedType = 0, mentionedTargets = []) {
        super(content);
    }

    digest() {
        return this.content;
    }

    encode() {
        let payload = super.encode();
        payload.searchableContent = this.content;
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.content = payload.searchableContent;
    }


}
