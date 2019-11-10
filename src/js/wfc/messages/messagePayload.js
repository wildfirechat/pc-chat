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
    binaryContent; // base64 string, 图片时，不包含头部信息:data:image/png;base64,
    localContent;
    mediaType;
    remoteMediaUrl;
    localMediaPath;
    mentionedType  = 0;
    mentionedTargets = [];
    extra;
}
