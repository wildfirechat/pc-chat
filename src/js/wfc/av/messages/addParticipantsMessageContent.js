import NotificationMessageContent from "../../messages/notification/notificationMessageContent";
import MessageContentType from "../../messages/messageContentType";
import wfc from "../../client/wfc"

class ParticipantStatus {
    userId;
    acceptTime;
    joinTime;
    videoMuted;
}

export default class AddParticipantsMessageContent extends NotificationMessageContent {
    callId;
    initiator;
    pin;
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
            pin: this.pin,
            participants: this.participants,
            existParticipants: this.existParticipants,
        };
        payload.binaryContent = wfc.utf8_to_b64(JSON.stringify(obj));

        return payload;
    }

    decode(payload) {
        super.decode(payload);
        this.callId = payload.content;
        let json = wfc.b64_to_utf8(payload.binaryContent);
        let obj = JSON.parse(json);
        this.initiator = obj.initiator;
        this.audioOnly = obj.audioOnly;
        this.pin = obj.pin;
        this.participants = obj.participants;
        this.existParticipants = obj.existParticipants;
    }
}
