/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import GroupNotificationContent from "./groupNotification";
import wfc from "../../client/wfc";
import MessageContentType from "../messageContentType";

export default class GroupJoinTypeNotificationContent extends GroupNotificationContent {
    operator;

    //在group type为Restricted时，0 开放加入权限（群成员可以拉人，用户也可以主动加入）；1 只能群成员拉人入群；2 只能群管理拉人入群
    joinType;


    constructor(operator, joinType) {
        super(MessageContentType.ChangeJoinType_Notification);
        this.operator = operator;
        this.type = joinType;
    }

    formatNotification(message) {
        let notifyStr;
        if (this.fromSelf) {
            notifyStr = '您';
        } else {
            notifyStr = wfc.getGroupMemberDisplayName(this.groupId, this.operator);
        }
        switch (this.joinType) {
            case 0:
                notifyStr += ' 开放了加入群组功能';
                break;
            case 1:
                notifyStr += ' 仅允许群成员邀请加入群组';
                break;
            case 2:
                notifyStr += " 只关闭了加入群组功能";
                break;
            default:
                break;
        }
        return notifyStr;
    }

    encode() {
        let payload = super.encode();
        let obj = {
            g: this.groupId,
            o: this.operator,
            n: (this.joinType + '')
        };
        payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj));
        return super.encode();
    }

    decode(payload) {
        super.decode(payload);
        let obj = JSON.parse(wfc.b64_to_utf8(payload.binaryContent));
        this.groupId = obj.g;
        this.operator = obj.o;
        this.joinType = parseInt(obj.n);
    }
}
