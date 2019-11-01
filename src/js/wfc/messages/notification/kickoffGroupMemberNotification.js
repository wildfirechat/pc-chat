import { Base64 } from 'js-base64';
import wfc from '../../client/wfc';
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
            let u = wfc.getUserInfo(this.operator);
            return u.displayName + '把 ';
        }

        let kickedMembersStr = '';
        this.kickedMembers.forEach(m => {
            let u = wfc.getUserInfo(m);
            kickedMembersStr += ' ' + u.displayName;
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
        payload.binaryContent = Base64.encode(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let json = Base64.decode(payload.binaryContent)
        let obj = JSON.parse(json);
        this.groupId = obj.g;
        this.operator = obj.o;
        this.kickedMembers = obj.ms;
    }
}