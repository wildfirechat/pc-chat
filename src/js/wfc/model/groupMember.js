/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import wfc from '../client/wfc'
export default class GroupMember {
    groupId = '';
    memberId = '';
    alias = '';
    type = 0;
    updateDt = 0;
    createDt = 0;

    getName() {
        let u = wfc.getUserInfo(this.memberId);
        return u.displayName;
    }

    getPortrait() {
        let u = wfc.getUserInfo(this.memberId);
        return u.portrait;
    }
}
