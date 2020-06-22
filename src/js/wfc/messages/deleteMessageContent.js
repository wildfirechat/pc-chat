import MessageContent from './messageContent'
import MessagePayload from './messagePayload';
import MessageContentType from './messageContentType';

export default class DeleteMessageContent extends MessageContent {
    content;
    operatorId = '';
    messageUid = new Long(0);

    constructor(operatorId, messageUid) {
        super(MessageContentType.DeleteMessage_Notification);
        this.operatorId = operatorId;
        this.messageUid = messageUid;
    }

    formatNotification(message) {
        return "消息已删除";
    }

    encode() {
        let payload = super.encode();
        payload.content = this.operatorId;
        payload.binaryContent = wfc.utf8_to_b64(this.messageUid.toString());
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.operatorId = payload.content;
        this.messageUid = Long.fromString(wfc.b64_to_utf8(payload.binaryContent));
    }
}
