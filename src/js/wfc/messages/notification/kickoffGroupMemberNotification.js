import wfc from '../../client/wfc'
import MessageContentType from "../messageContentType";

import GroupNotificationContent from "./groupNotification";

export default class KickoffGroupMemberNotification extends GroupNotificationContent {
    operator = '';
    kickedMembers = [];

    constructor(operator, kickedMembers) {
        super(MessageContentType.KickOffGroupMember_Notification);
        this.operator = operator;
        this.kickedMembers = kickedMembers;
    }

    formatNotification() {
        let notifyStr;
        if (this.fromSelf) {
            notifyStr = '您把 ';
        } else {
            notifyStr = wfc.getGroupMemberDisplayName(this.groupId, this.operator) + '把 ';
        }

        let kickedMembersStr = '';
        this.kickedMembers.forEach(m => {
            kickedMembersStr += ' ' + wfc.getGroupMemberDisplayName(this.groupId, m);
        });

        return notifyStr + kickedMembersStr + ' 移除了群组';
    }

    encode() {
        let payload = super.encode();
        let obj = {
            g: this.groupId,
            ms: this.kickedMembers,
            o: this.operateUser,
        };
        payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let json = wfc.b64_to_utf8(payload.binaryContent)
        let obj = JSON.parse(json);
        this.groupId = obj.g;
        this.operator = obj.o;
        this.kickedMembers = obj.ms;
    }
}
