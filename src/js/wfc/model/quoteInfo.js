import wfc from "../client/wfc";
import { stringValue } from "../util/longUtil";
import Long from "long";

export default class QuoteInfo {
    messageUid;
    userId;
    userDisplayName;
    messageDigest;

    static initWithMessage(message) {
        let info = new QuoteInfo();
        if (message) {
            info.messageUid = message.messageUid;
            info.userId = message.from;
            let userInfo = wfc.getUserInfo(message.from, false);
            info.userDisplayName = userInfo.displayName;
            info.messageDigest = message.messageContent.digest();
            if (info.messageDigest.length > 48) {
                info.messageDigest = info.messageDigest.substr(0, 48);
            }
        }
        return info;
    }

    encode() {
        let obj = {
            u: stringValue(this.messageUid),
            i: this.userId,
            n: this.userDisplayName,
            d: this.messageDigest,
        };
        return obj;
    }

    decode(obj) {
        this.messageUid = Long.fromValue(obj.u);
        this.userId = obj.i;
        this.userDisplayName = obj.n;
        this.messageDigest = obj.d;
    }
}
