import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../client/wfc'
import MessageContentType from '../messageContentType';
import atob from 'atob';
import btoa from 'btoa';
import GroupNotificationContent from './groupNotification';

export default class ModifyGroupAliasNotification extends GroupNotificationContent {
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
            g: this.groupId,
            n: this.alias,
            o: this.operator,
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
        this.alias = obj.n;
    }
}
