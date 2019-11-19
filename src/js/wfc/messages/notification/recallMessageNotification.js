import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../client/wfc'
import MessageContentType from '../messageContentType';
import Long from 'long';

export default class RecallMessageNotification extends NotificationMessageContent {
    operatorId = '';
    messageUid = new Long(0);

    constructor(operatorId, messageUid) {
        super(MessageContentType.RecallMessage_Notification);
        this.operatorId = operatorId;
        this.messageUid = messageUid;
    }

    formatNotification() {
        let u = wfc.getUserInfo(this.operatorId);
        return u.displayName + "撤回了一条消息";
    }

    encode() {
        let payload = super.encode();
        payload.content = this.operatorId;
        payload.binaryContent = Message.utf8_to_b64(this.messageUid.toString());
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.operatorId = payload.content;
        this.messageUid = Long.fromString(Message.b64_to_utf8(payload.binaryContent));
    }
}
