import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../wfc'
import MessageContentType from '../messageContentType';
import { Base64 } from 'js-base64';

export default class TransferGroupOwnerNotification extends NotificationMessageContent {
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
            o: this.operator,
            m: this.newOwner,
        };
        payload.binaryContent = Base64.encode(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let json = Base64.decode(payload.binaryContent)
        let obj = JSON.parse(json);
        this.operator = obj.o;
        this.newOwner = obj.m;
    }
}