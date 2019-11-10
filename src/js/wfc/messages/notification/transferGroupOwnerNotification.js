import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../client/wfc'
import MessageContentType from '../messageContentType';
import GroupNotificationContent from './groupNotification';

export default class TransferGroupOwnerNotification extends GroupNotificationContent {
    operator = '';
    newOwner = '';

    constructor(operator, newOwner) {
        super(MessageContentType.TransferGroupOwner_Notification);
        this.operator = operator;
        this.newOwner = newOwner;
    }

    formatNotification() {
        let nu = wfc.getUserInfo(this.newOwner);
        if (this.fromSelf) {
            return '您把群转让给了 ' + nu.displayName;
        } else {
            let u = wfc.getUserInfo(this.operator);
            return u.displayName + '把群转让给了 ' + nu.displayName;
        }
    }

    encode() {
        let payload = super.encode();
        let obj = {
            g: this.groupId,
            o: this.operator,
            m: this.newOwner,
        };
        payload.binaryContent = btoa(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let json = atob(payload.binaryContent)
        let obj = JSON.parse(json);
        this.groupId = obj.g;
        this.operator = obj.o;
        this.newOwner = obj.m;
    }
}
