import NotificationMessageContent from "./notificationMessageContent";
import MessagePayload from "../messagePayload";
import wfc from '../../wfc'

export default class ChangeGroupNameNotification extends NotificationMessageContent {
    operateUser = '';
    name = '';

    formatNotification() {
        if (this.fromSelf) {
            return '您修改群名称为：' + this.name;
        } else {
            let u = wfc.getUserInfo(this.operateUser);
            return u.displayName + '修改群名称为：' + this.name;
        }
    }

    encode() {
        let payload = new MessagePayload();
        let obj = {
            n: this.name,
            o: this.operateUser,
        };
        payload.binaryContent = btoa(obj);
    }

    decode(payload) {
        super.decode(payload);
        let json = atob(payload.binaryContent)
        let n = JSON.parse(json);
        this.operateUser = n.o;
        this.name = n.n;
        console.log(this.operateUser);
    }

}