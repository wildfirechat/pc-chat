export default class MessageContent{
    type;
    persistFlag;
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
        // TODO parse type etc.
    }
}