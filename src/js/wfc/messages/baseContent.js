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
     * @param {object} content object json.parse from message#content 
     */
    decode(content){
        this.type = content.type;
        this.mentionedType = content.mentionedType;
        this.mentionedTargets = content.mentionedTargets;
    }
}