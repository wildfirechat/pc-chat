import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../wfc'
export default class TransferGroupOwnerNotification extends NotificationMessageContent {
    operator = '';
    newOwner = '';

    constructor(operator, newOwner) {
        super();
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
            o: this.operator,
            m: this.newOwner,
        };
        payload.binaryContent = btoa(JSON.stringify(obj));
    }

    decode(payload) {
        super.decode(payload);
        let json = atob(payload.binaryContent)
        let obj = JSON.parse(json);
        this.operator = obj.o;
        this.newOwner = obj.m;
    }
}