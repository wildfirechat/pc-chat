import NotificationMessageContent from "./notificationMessageContent";
import MessagePayload from "../messagePayload";
import wfc from '../../wfc'

export default class ChangeGroupNameNotification extends NotificationMessageContent {
    operator = '';
    name = '';

    constructor(operator, name) {
        super();
        this.operator = operator;
        this.name = name;
    }

    formatNotification() {
        if (this.fromSelf) {
            return '您修改群名称为：' + this.name;
        } else {
            let u = wfc.getUserInfo(this.operator);
            return u.displayName + '修改群名称为：' + this.name;
        }
    }

    encode() {
        let payload = new MessagePayload();
        let obj = {
            n: this.name,
            o: this.operator,
        };
        payload.binaryContent = btoa(JSON.stringify(obj));
    }

    decode(payload) {
        super.decode(payload);
        let json = atob(payload.binaryContent)
        let obj = JSON.parse(json);
        this.operator = obj.o;
        this.name = obj.n;
    }

}