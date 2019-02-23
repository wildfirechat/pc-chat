/**
 * 
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
 */
export default class MessagePayload{
    type;
    searchableContent;
    pushContent;
    content;
    binaryContent;
    localContent;
    mediaType;
    remoteMediaUrl;
    localMediaPath;
    mentionedType  = 0;
    mentionedTargets = [];
}