import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../wfc'
import MessageContentType from '../messageContentType';
import { Base64 } from 'js-base64';

export default class QuitGroupNotification extends NotificationMessageContent {
    operator = '';

    constructor(operator) {
        super(MessageContentType.QuitGroup_Notification);
        this.operator = operator;
    }

    formatNotification() {
        if (this.fromSelf) {
            return '您退出了群组';
        } else {
            let u = wfc.getUserInfo(this.operator);
            return u.displayName + '退出了群组';
        }
    }

    encode() {
        let payload = super.encode();
        let obj = {
            o: this.operator,
        };
        payload.binaryContent = Base64.encode(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let json = Base64.decode(payload.binaryContent)
        let obj = JSON.parse(json);
        this.operator = obj.o;
    }
}