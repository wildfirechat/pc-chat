/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import GroupInfo from "./groupInfo";

export default class GroupSearchResult {
    groupInfo;
    //0 march group name, 1 march group member name, 2 both
    matchType;
    matchMembers = [];

    static fromProtoGroupSearchResult(obj) {
        let groupSearchResult = new GroupSearchResult();
        groupSearchResult.groupInfo = Object.assign(new GroupInfo(), obj.groupInfo)
        groupSearchResult.matchType = obj.marchedType;
        groupSearchResult.matchMembers = obj.marchedMembers;

    }
}