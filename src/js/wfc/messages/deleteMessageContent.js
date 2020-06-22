import MessageContent from './messageContent'
import MessageContentType from './messageContentType';
import wfc from '../../wfc/client/wfc'
import Long from 'long'

// 本消息由调用server api删除消息触发，请勿直接发送本消息
export default class DeleteMessageContent extends MessageContent {
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
