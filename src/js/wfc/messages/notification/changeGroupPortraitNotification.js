import wfc from '../../client/wfc'
import MessageContentType from "../messageContentType";

import GroupNotificationContent from "./groupNotification";

export default class ChangeGroupPortraitNotification extends GroupNotificationContent {
    operator = '';

    constructor(operator) {
        super(MessageContentType.ChangeGroupPortrait_Notification);
        this.operator = operator;
    }

    formatNotification() {
        if (this.fromSelf) {
            return '您修改群头像';
        } else {
            let u = wfc.getUserInfo(this.operator);
            return u.displayName + '修改了群头像';
        }
    }

    encode() {
        let payload = super.encode();
        let obj = {
            g: this.groupId,
            n: this.name,
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
