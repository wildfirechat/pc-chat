import NotificationMessageContent from './notificationMessageContent'
import wfc from '../../wfc'
import MessageContentType from '../messageContentType';
export default class CreateGroupNotification extends NotificationMessageContent {
    creator = '';
    groupName = '';

    constructor(creator, groupName) {
        super(MessageContentType.CreateGroup_Notification);
        this.creator = creator;
        this.groupName = groupName;
    }

    formatNotification() {
        if (this.fromSelf) {
            return '您创建了群组 ' + this.groupName;
        } else {
            let u = wfc.getUserInfo(this.creator);
            return u.displayName + '创建了群组 ' + this.groupName;
        }
    }

    encode() {
        let payload = super.encode();
        let obj = {
            n: this.groupName,
            o: this.creator,
        };
        payload.binaryContent = btoa(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let json = atob(payload.binaryContent)
        let obj = JSON.parse(json);
        this.creator = obj.o;
        this.groupName = obj.n;
    }
}