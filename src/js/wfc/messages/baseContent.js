export default class MessageContent{
    type;
    mentionedType = 0;
    mentionedTargets = [];

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