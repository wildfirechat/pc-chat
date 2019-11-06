import wfc from '../client/wfc'
export default class GroupMember {
    groupId = '';
    memberId = '';
    alias = '';
    type = 0;
    updateDt = 0;

    getName() {
        let u = wfc.getUserInfo(this.memberId);
        return u.displayName;
    }

    getPortrait() {
        let u = wfc.getUserInfo(this.memberId);
        return u.portrait;
    }
}