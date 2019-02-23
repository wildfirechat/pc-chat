/**
 * 
    message in json format
    {
        "conversation":{
            "conversationType": 0, 
            "target": "UZUWUWuu", 
            "line": 0, 
        }
        "from": "UZUWUWuu", 
        "content": {
            "type": 1, 
            "searchableContent": "1234", 
            "pushContent": "", 
            "content": "", 
            "binaryContent": "", 
            "localContent": "", 
            "mediaType": 0, 
            "remoteMediaUrl": "", 
            "localMediaPath": "", 
            "mentionedType": 0, 
            "mentionedTargets": [ ]
        }, 
        "messageId": 52, 
        "direction": 1, 
        "status": 5, 
        "messageUid": 75735276990792720, 
        "timestamp": 1550849394256, 
        "to": ""
    }
 */
import MessagePayload from './messagePayload'
import Conversation from '../conversation'
export default class Message{
    conversation = {};
    from = '';
    content = {}; // 解析之前是MessagePayload, 解析之后是具体的messageContent
    messageId = 0;
    direction = 0;
    status = 0;
    messageUid = 0;
    timestamp  = 0;
    to = '';
}