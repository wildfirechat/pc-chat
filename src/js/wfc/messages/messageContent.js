import MessagePayload from "./messagePayload";

export default class MessageContent {
    type;
    //0 普通消息, 1 部分提醒, 2 提醒全部
    mentionedType = 0;
    //提醒对象，mentionedType 1时有效
    mentionedTargets = [];
    extra;

    constructor(type, mentionedType = 0, mentionedTargets = []) {
        this.type = type;
        this.mentionedType = mentionedType;
        this.mentionedTargets = mentionedTargets;
    }

    digest() {
        return '...digest...';
    }

    /**
     * return MessagePayload in json format
     */
    encode() {
        let payload = new MessagePayload();
        payload.type = this.type;
        payload.mentionedType = this.mentionedType;
        payload.mentionedTargets = this.mentionedTargets;
        return payload;
    }

    /**
     * 
     * @param {object} payload object json.parse from message#content 
     */
    decode(payload) {
        this.type = payload.type;
        this.mentionedType = payload.mentionedType;
        this.mentionedTargets = payload.mentionedTargets;
    }
}
