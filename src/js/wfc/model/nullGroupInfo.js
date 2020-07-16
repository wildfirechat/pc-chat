import GroupInfo from "./groupInfo";

export default class NullGroupInfo extends GroupInfo {
    constructor(groupId) {
        super();
        this.target = groupId;
        // this.name = '<' + groupId+ '>';
        this.name = '群聊';
    }
}
