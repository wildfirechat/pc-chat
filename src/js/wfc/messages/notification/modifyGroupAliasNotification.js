/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import wfc from '../../client/wfc'
import MessageContentType from '../messageContentType';

import GroupNotificationContent from './groupNotification';

export default class ModifyGroupAliasNotification extends GroupNotificationContent {
    operator = '';
    alias = '';
    memberId = '';

    constructor(creator, alias) {
        super(MessageContentType.ModifyGroupAlias_Notification);
        this.operator = creator;
        this.alias = alias;
    }

    formatNotification() {
        let notificationStr = '';
        if (this.fromSelf) {
            notificationStr += '你';
        } else {
            let userInfo = wfc.getUserInfo(this.operator, false, this.groupId)
            if(userInfo.groupAlias){
                notificationStr += userInfo.groupAlias;
            }else if (userInfo.friendAlias){
                notificationStr += userInfo.friendAlias;
            }else if(userInfo.displayName){
                notificationStr += userInfo.displayName;
            }else {
                notificationStr += this.operator;
        }
        }
        notificationStr += '修改';
        if(this.memberId){
            let userInfo = wfc.getUserInfo(this.memberId, false);
            if(userInfo.friendAlias){
                notificationStr += userInfo.friendAlias;
            }else if (userInfo.displayName) {
                notificationStr += userInfo.displayName;
            }else {
                notificationStr += this.memberId;
            }
            notificationStr += '的';
        }
        notificationStr += '群昵称为';
        notificationStr += this.alias;

        return notificationStr;
    }

    encode() {
        let payload = super.encode();
        let obj = {
            g: this.groupId,
            n: this.alias,
            o: this.operator,
            m: this.memberId,
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
        this.alias = obj.n;
        this.memberId = obj.m;
    }
}
