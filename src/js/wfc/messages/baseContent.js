import MessagePayload from "./messagePayload";

export default class MessageContent{
    type;
    mentionedType = 0;
    mentionedTargets = [];

    constructor(type, mentionedType = 0, mentionedTargets = []){
        this.type = type;
        this.mentionedType = mentionedType;
        this.mentionedTargets = mentionedTargets;
    }

    digest(){
        // do nothing
    };   

    /**
     * return MessagePayload in json format
     */
    encode(){
        let payload = new MessagePayload();
        payload.type = this.type;
        payload.mentionedType = this.mentionedType;
        payload.mentionedTargets = this.mentionedTargets;
        return payload;
    };

    /**
     * 
     * @param {object} payload object json.parse from message#content 
     */
    decode(payload){
        this.type = payload.type;
        this.mentionedType = payload.mentionedType;
        this.mentionedTargets = payload.mentionedTargets;
    }
}