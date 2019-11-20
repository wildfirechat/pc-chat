import wfc from '../../client/wfc'
import MessageContentType from '../messageContentType';

import GroupNotificationContent from './groupNotification';

export default class QuitGroupNotification extends GroupNotificationContent {
    operator = '';

    constructor(operator) {
        super(MessageContentType.QuitGroup_Notification);
        this.operator = operator;
    }

    formatNotification() {
        if (this.fromSelf) {
            return '您退出了群组';
        } else {
            let u = wfc.getUserInfo(this.operator);
            return u.displayName + '退出了群组';
        }
    }

    encode() {
        let payload = super.encode();
        let obj = {
            g: this.groupId,
            o: this.operator,
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
    }
}
