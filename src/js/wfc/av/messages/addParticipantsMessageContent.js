import NotificationMessageContent from "../../messages/notification/notificationMessageContent";
import {Base64} from "js-base64";
import MessageContentType from "../../messages/messageContentType";

class ParticipantStatus {
    userId;
    acceptTime;
    joinTime;
    videoMuted;
}

export default class AddParticipantsMessageContent extends NotificationMessageContent {
    callId;
    initiator;
    participants;
    existParticipants;
    audioOnly;

    constructor(mentionedType = 0, mentionedTargets = []) {
        super(MessageContentType.VOIP_CONTENT_TYPE_ADD_PARTICIPANT, mentionedType, mentionedTargets);
    }

    formatNotification(message) {
        // TODO
        return "add participant";
    }

    encode() {
        let payload = super.encode();
        payload.content = this.callId;

        let obj = {
            initiator: this.initiator,
            audioOnly: this.audioOnly ? 1 : 0,
            participants: this.participants,
            existParticipants: this.existParticipants,
        };
        payload.binaryContent = Base64.encode(JSON.stringify(obj));

        return payload;
    }

    decode(payload) {
        super.decode(payload);
        this.callId = payload.content;
        let json = Base64.decode(payload.binaryContent);
        let obj = JSON.parse(json);
        this.initiator = obj.initiator;
        this.audioOnly = obj.audioOnly;
        this.participants = obj.participants;
        this.existParticipants = obj.existParticipants;
    }
}
