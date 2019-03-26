import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../wfc'
import MessageContentType from '../messageContentType';
import { Base64 } from 'js-base64';

export default class ModifyGroupAliasNotification extends NotificationMessageContent {
    operator = '';
    alias = '';

    constructor(creator, alias) {
        super(MessageContentType.ModifyGroupAlias_Notification);
        this.operator = creator;
        this.alias = alias;
    }

    formatNotification() {
        if (this.fromSelf) {
            return '您修改群昵称为 ' + this.alias;
        } else {
            let u = wfc.getUserInfo(this.operator);
            return u.displayName + '修改群昵称为 ' + this.alias;
        }
    }

    encode() {
        let payload = super.encode();
        let obj = {
            n: this.alias,
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
        this.alias = obj.n;
    }
}