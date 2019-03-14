import MessageContent from './messageContent'
import MessagePayload from './messagePayload';
import MessageContentType from './messageContentType';
export default class LocationMessageContent extends MessageContent {
    // TODO


    digest() {
    }

    encode() {
        let payload = super.encode();
        return payload;
    };

    decode(payload) {
        super.decode(payload);
    }


}
