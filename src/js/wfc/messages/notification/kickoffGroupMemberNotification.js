import NotificationMessageContent from "./notificationMessageContent";
import wfc from '../../wfc'
import MessageContentType from "../messageContentType";

export default class KickoffGroupMemberNotification extends NotificationMessageContent {
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
            notifyStr = '您把:';
        } else {
            let u = wfc.getUserInfo(this.operator);
            return u.displayName + '把:';
        }

        let kickedMembersStr = '';
        kickedMembers.forEach(m => {
            let u = wfc.getUserInfo(m);
            kickedMembersStr += ' ' + u.displayName;
        });

        return notifyStr + kickedMembersStr + '移除了群组';
    }

    encode() {
        let payload = super.encode();
        let obj = {
            ms: this.kickedMembers,
            o: this.operateUser,
        };
        payload.binaryContent = btoa(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let json = atob(payload.binaryContent)
        let obj = JSON.parse(json);
        this.operator = obj.o;
        this.kickedMembers = obj.ms;
    }
}