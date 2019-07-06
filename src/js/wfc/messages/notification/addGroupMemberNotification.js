import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../wfc'
import MessageContentType from '../messageContentType';
import { Base64 } from 'js-base64';
export default class AddGroupMemberNotification extends NotificationMessageContent {
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
            let u = wfc.getUserInfo(m, false);
            membersStr += ' ' + u.displayName;
        });

        return notifyStr + membersStr + '加入了群组';
    }

    encode() {
        let payload = super.encode();
        let obj = {
            o: this.invitor,
            ms: this.invitees,
        };
        payload.binaryContent = Base64.encode(JSON.stringify(obj));
        return payload;
    };

    decode(payload) {
        super.decode(payload);
        let json = Base64.decode(payload.binaryContent);
        let obj = JSON.parse(json);
        this.invitor = obj.o;
        this.invitees = obj.ms;
    }
}