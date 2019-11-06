import { Base64 } from 'js-base64';
import wfc from '../../client/wfc';
import MessageContentType from '../messageContentType';
import GroupNotificationContent from './groupNotification';

export default class CreateGroupNotification extends GroupNotificationContent {
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
            g: this.groupId,
            n: this.groupName,
            o: this.creator,
        };
        payload.binaryContent = Base64.encode(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let json = Base64.decode(payload.binaryContent)
        let obj = JSON.parse(json);
        this.groupId = obj.g;
        this.creator = obj.o;
        this.groupName = obj.n;
    }
}