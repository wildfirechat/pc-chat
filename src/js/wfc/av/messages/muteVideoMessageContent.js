/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

import NotificationMessageContent from "../../messages/notification/notificationMessageContent";
import MessageContentType from "../../messages/messageContentType";
import wfc from "../../client/wfc"

class ParticipantStatus {
    userId;
    acceptTime;
    joinTime;
    videoMuted;
}

export default class MuteVideoMessageContent extends NotificationMessageContent {
    callId;
    videoMuted;
    existParticipants;

    constructor(mentionedType = 0, mentionedTargets = []) {
        super(MessageContentType.VOIP_CONTENT_TYPE_MUTE_VIDEO, mentionedType, mentionedTargets);
    }

    formatNotification(message) {
        // TODO
        return "mute video";
    }

    encode() {
        let payload = super.encode();
        payload.content = this.callId;

        let obj = {
            existParticipants: this.existParticipants,
            videoMuted:this.videoMuted,
        };
        payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj));

        return payload;
    }

    decode(payload) {
        super.decode(payload);
        this.callId = payload.content;
        let json = wfc.b64_to_utf8(payload.binaryContent);
        let obj = JSON.parse(json);
        this.existParticipants = obj.existParticipants;
        this.videoMuted = obj.videoMuted;
    }
}
