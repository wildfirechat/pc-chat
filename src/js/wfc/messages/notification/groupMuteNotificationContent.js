import GroupNotificationContent from "./groupNotification";
import MessageContentType from "../messageContentType";
import wfc from "../../client/wfc";

export default class GroupMuteNotificationContent extends GroupNotificationContent {
    operator;

    //0 正常；1 全局禁言
    muteType;

    constructor(operator, muteType) {
        super(MessageContentType.MuteGroupMember_Notification);
        this.operator = operator;
        this.muteType = muteType;
    }

    formatNotification(message) {
        // return sb.toString();
        let notifyStr = this.fromSelf ? '您' : wfc.getGroupMemberDisplayName(this.groupId, this.operator);
        notifyStr += this.muteType === 0 ? ' 关闭了全员禁言' : ' 开启了全员禁言';

        return notifyStr;
    }

    encode() {
        let payload = super.encode();
        let obj = {
            g: this.groupId,
            o: this.operator,
            n: this.muteType + ''
        };
        payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let obj = JSON.parse(wfc.b64_to_utf8(payload.binaryContent));
        this.groupId = obj.g;
        this.operator = obj.o;
        this.muteType = parseInt(obj.n);
    }
}
