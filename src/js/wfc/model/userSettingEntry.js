/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import UserSettingScope from "../client/userSettingScope";

export default class UserSettingEntry {
    scope = UserSettingScope.kUserSettingCustomBegin;
    key = '';
    value = '';
    updateDt = 0;
}
