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
        // TODO return a object
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