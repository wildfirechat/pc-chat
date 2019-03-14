import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../wfc'
import MessageContentType from '../messageContentType';
export default class RecallMessageNotification extends NotificationMessageContent {
    operatorId = '';
    messageUid = 0;

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
        payload.binaryContent = btoa(this.messageUid + '');
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        this.operatorId = payload.content;
        this.messageUid = Number(atob(payload.binaryContent));
    }
}