import TextMessageContent from './messages/textMessageContent'
import ImageMessageContent from './messages/imageMessageContent';

export const ContentType_Text= 1;
export const ContentType_Voice= 2;
export const ContentType_Image= 3;
export const ContentType_Location= 4;
export const ContentType_File= 5;
export const ContentType_Video= 6;
export const ContentType_Sticker= 7;
export const ContentType_ImageText = 8;

export const PersitFlag_No_Persist = 0;
export const PersitFlag_Persist= 1;
export const PersitFlag_Persist_And_Count= 3;
export const PersitFlag_Transparent= 4;

export function getMessageContentClazz(type){
    for (const content of MessageContents) {
        if(content.type === type){
            return content.contentClazz;
        }
    }
    return null;
}

export const MessageContents = [
    {
        name:'text',
        flag:PersitFlag_Persist_And_Count,
        type:ContentType_Text,
        contentClazz:TextMessageContent,
    },
    {
        name:'voice',
        flag:PersitFlag_Persist_And_Count,
        type:ContentType_Voice,
    },
    {
        name:'image',
        flag:PersitFlag_Persist_And_Count,
        type:ContentType_Image,
        contentClazz: ImageMessageContent,
    },
    {
        name:'location',
        flag:PersitFlag_Persist_And_Count,
        type:ContentType_Location,
    },
    {
        name:'file',
        flag:PersitFlag_Persist_And_Count,
        type:ContentType_File,
    },
    {
        name:'video',
        flag:PersitFlag_Persist_And_Count,
        type:ContentType_Video,
    },
    {
        name:'sticker',
        flag:PersitFlag_Persist_And_Count,
        type:ContentType_Sticker,
    },
    {
        name:'imageText',
        flag:PersitFlag_Persist_And_Count,
        type:ContentType_ImageText,
    },
];