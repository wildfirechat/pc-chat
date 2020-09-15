/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import UserInfo from "./userInfo";

export default class NullUserInfo extends UserInfo {
    constructor(userId) {
        super();
        this.uid = userId;
        //this.name = '<' + userId + '>';
        this.name = '用户';
        this.displayName = this.name;
        this.portrait = '';
    }
}
