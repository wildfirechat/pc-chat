import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../client/wfc'
import MessageContentType from '../messageContentType';

import GroupNotificationContent from './groupNotification';

export default class AddGroupMemberNotification extends GroupNotificationContent {
    invitor = '';
    invitees = [];

    constructor(invitor, invitees) {
        super(MessageContentType.AddGroupMember_Notification);
        this.invitor = invitor;
        this.invitees = invitees;
    }

    formatNotification() {
        let notifyStr;
        if (this.fromSelf) {
            notifyStr = '您邀请:';
        } else {
            let u = wfc.getUserInfo(this.invitor);
            notifyStr = u.displayName + '邀请:';
        }

        let membersStr = '';
        this.invitees.forEach(m => {
            let u = wfc.getUserInfo(m, true);
            membersStr += ' ' + u.displayName;
        });

        return notifyStr + membersStr + '加入了群组';
    }

    encode() {
        let payload = super.encode();
        let obj = {
            g: this.groupId,
            o: this.invitor,
            ms: this.invitees,
        };
        payload.binaryContent = Message.utf8_to_b64(JSON.stringify(obj));
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        let json = Message.b64_to_utf8(payload.binaryContent);
        let obj = JSON.parse(json);
        this.groupId = obj.g;
        this.invitor = obj.o;
        this.invitees = obj.ms;
    }
}
