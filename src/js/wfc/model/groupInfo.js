import GroupType from "./groupType";

/*
public String target;
    public String name;
    public String portrait;
    public String owner;
    public GroupType type;
    public int memberCount;
    public String extra;
    public long updateDt
    */

export default class GroupInfo {
    target = '';
    name = '';
    portrait = '';
    owner = '';
    type = GroupType.Normal;
    memberCount = 0;
    extra = '';
    updateDt = 0;
    memberUpdateDt = 0;
    //0 正常；1 全局禁言
    mute = 0;

    //在group type为Restricted时，0 开放加入权限（群成员可以拉人，用户也可以主动加入）；1 只能群成员拉人入群；2 只能群管理拉人入群
    joinType = 0;

    //是否运行群中普通成员私聊。0 允许，1不允许
    privateChat = 0;

    //是否可以搜索到该群，功能暂未实现
    searchable
}
