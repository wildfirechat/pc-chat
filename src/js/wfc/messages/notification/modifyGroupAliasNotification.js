import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../client/wfc'
import MessageContentType from '../messageContentType';

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
        payload.binaryContent = Message.utf8_to_b64(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let json = Message.b64_to_utf8(payload.binaryContent)
        let obj = JSON.parse(json);
        this.groupId = obj.g;
        this.operator = obj.o;
        this.alias = obj.n;
    }
}
