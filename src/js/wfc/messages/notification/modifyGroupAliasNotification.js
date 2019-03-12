import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../wfc'
export default class ModifyGroupAliasNotification extends NotificationMessageContent {
    operator = '';
    alias = '';

    constructor(creator, alias) {
        super();
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
        payload.binaryContent = btoa(JSON.stringify(obj));
    }

    decode(payload) {
        super.decode(payload);
        let json = atob(payload.binaryContent)
        let obj = JSON.parse(json);
        this.operator = obj.o;
        this.alias = obj.n;
    }
}