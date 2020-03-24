import GroupNotificationContent from "./groupNotification";
import MessageContentType from "../messageContentType";
import wfc from "../../client/wfc";

export default class GroupPrivateChatNotificationContent extends GroupNotificationContent {
    operator;

    //是否运行群中普通成员私聊。0 允许，1不允许
    privateChatType;

    constructor(operator, privateChatType) {
        super(MessageContentType.ChangePrivateChat_Notification);
        this.operator = operator;
        this.privateChatType = privateChatType;
    }

    formatNotification(message) {
        // return sb.toString();
        let notifyStr = this.fromSelf ? '您' : wfc.getGroupMemberDisplayName(this.groupId, this.operator);
        notifyStr += this.privateChatType === 0 ? ' 开启了成员私聊' : ' 关闭了成员私聊';

        return notifyStr;
    }

    encode() {
        let payload = super.encode();
        let obj = {
            g: this.groupId,
            o: this.operator,
            n: this.privateChatType + ''
        };
        payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj));
        return payload;
    }

    decode(payload) {
        super.decode(payload);
        let obj = JSON.parse(wfc.b64_to_utf8(payload.binaryContent));
        this.groupId = obj.g;
        this.operator = obj.o;
        this.privateChatType = parseInt(obj.n);
    }
}
