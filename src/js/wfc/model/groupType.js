export default class GroupType {
    static Normal = 0;
    static Free = 1;
    static Restricted = 2;
    //
    static modifyGroupName = 0;
    static modifyGroupPortrait = 1;
    static modifyGroupExtra = 2;
    static modifyGroupMute = 3;
    static modifyGroupJoinType = 4;
    static modifyGroupPrivateChat = 5;
    static modifyGroupSearchable = 6;

    //
    static openTalk = '0';
    static stopTalk = '1';
    static allowTempChat = '0';
    static notAllowTempChat ='1';
    static canSearch = '0';
    static canNotSearch = '1';
    static notLimitJoin = '0';
    static memberJoin = '1';
    static managerJoin = '2';
}
