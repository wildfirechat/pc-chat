/**
 * 
        "conversation":{
            "conversationType": 0, 
            "target": "UZUWUWuu", 
            "line": 0, 
        }
 */
export default class Conversation{
    conversationType = 0;
    target = '';
    line = 0;

    constructor(type, target, line){
        this.conversationType = type;
        this.target = target;
        this.line = line;
    }
}