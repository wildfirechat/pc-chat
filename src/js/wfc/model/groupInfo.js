import { GroupType_Normal } from "./groupTypes";

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
    type = GroupType_Normal;
    memberCount = 0;
    extra = '';
    updateDt;
}