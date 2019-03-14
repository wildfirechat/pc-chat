import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../wfc'
import MessageContentType from '../messageContentType';
export default class DismissGroupNotification extends NotificationMessageContent {
    operator = '';

    constructor(operator) {
        super(MessageContentType.DismissGroup_Notification);
        this.operator = operator;
    }

    formatNotification() {
        if (this.fromSelf) {
            return '您解散了群组';
        } else {
            let u = wfc.getUserInfo(this.operator);
            return u.displayName + '解散了群组';
        }
    }

    encode() {
        let payload = super.encode();
        let obj = {
            o: this.operator,
        };
        payload.binaryContent = btoa(JSON.stringify(obj));
    }

    decode(payload) {
        super.decode(payload);
        let json = atob(payload.binaryContent)
        let obj = JSON.parse(json);
        this.operator = obj.o;
    }
}