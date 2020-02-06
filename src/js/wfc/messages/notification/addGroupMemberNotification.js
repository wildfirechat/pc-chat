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
        if (this.invitees.length === 1 && this.invitees[0] === this.invitor) {
          if (this.fromSelf) {
              return '您加入了群组';
          } else {
              return wfc.getGroupMemberDisplayName(this.groupId, this.invitor) + ' 加入了群组';
          }
        }

        if (this.fromSelf) {
            notifyStr = '您邀请:';
        } else {
            notifyStr = wfc.getGroupMemberDisplayName(this.groupId, this.invitor) + '邀请:';
        }

        let membersStr = '';
        this.invitees.forEach(m => {
            membersStr += ' ' + wfc.getUserDisplayName(m);
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
        payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj));
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        let json = wfc.b64_to_utf8(payload.binaryContent);
        let obj = JSON.parse(json);
        this.groupId = obj.g;
        this.invitor = obj.o;
        this.invitees = obj.ms;
    }
}
