import NotificationMessageContent from "./notificationMessageContent";
import wfc from '../../wfc'
import MessageContentType from "../messageContentType";
import { Base64 } from 'js-base64';


export default class ChangeGroupPortraitNotification extends NotificationMessageContent {
    operator = '';

    constructor(operator) {
        super(MessageContentType.ChangeGroupPortrait_Notification);
        this.operator = operator;
    }

    formatNotification() {
        if (this.fromSelf) {
            return '您修改群头像';
        } else {
            let u = wfc.getUserInfo(this.operator);
            return u.displayName + '修改了群头像';
        }
    }

    encode() {
        let payload = super.encode();
        let obj = {
            n: this.name,
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