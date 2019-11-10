import UserSettingScope from "../client/userSettingScope";

export default class UserSettingEntry {
    scope = UserSettingScope.kUserSettingCustomBegin;
    key = '';
    value = '';
    updateDt = 0;
}
