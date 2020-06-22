import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../client/wfc'
import MessageContentType from '../messageContentType';
import Long from 'long';
import ConversationType from "../../model/conversationType";

export default class RecallMessageNotification extends NotificationMessageContent {
    operatorId = '';
    messageUid = new Long(0);

    constructor(operatorId, messageUid) {
        super(MessageContentType.RecallMessage_Notification);
        this.operatorId = operatorId;
        this.messageUid = messageUid;
    }

    formatNotification(message) {
        if(message.conversation.type === ConversationType.Group){
            return wfc.getGroupMemberDisplayName(message.conversation.target, this.operatorId) + "撤回了一条消息";
        }else {
            return wfc.getUserDisplayName(this.operatorId) + "撤回了一条消息";
        }
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
