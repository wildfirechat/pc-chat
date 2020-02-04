import UserInfo from "./userInfo";

export default class NullUserInfo extends UserInfo {
    constructor(userId) {
        super();
        this.uid = userId;
        this.name = '<' + userId + '>';
        this.displayName = this.name;
        this.portrait = '';
    }
}
