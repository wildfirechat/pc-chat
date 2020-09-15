/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

export default class ChatRoomInfo {
    chatRoomId;
    title;
    desc;
    portrait;
    extra;
    // 0, normal; 1, not start; 2, end
    state;
    memberCount;
    createDt;
    updateDt;
}