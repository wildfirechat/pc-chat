import TextMessageContent from './messages/textMessageContent'
import ImageMessageContent from './messages/imageMessageContent';

import { ContentType_Text, ContentType_Tip_Notification, ContentType_Unknown } from './messages/messageTypes';
import { ContentType_Voice } from './messages/messageTypes';
import { ContentType_Image } from './messages/messageTypes';
import { ContentType_Location } from './messages/messageTypes';
import { ContentType_File } from './messages/messageTypes';
import { ContentType_Video } from './messages/messageTypes';
import { ContentType_Sticker } from './messages/messageTypes';
import { ContentType_ImageText } from './messages/messageTypes';

import { PersitFlag_No_Persist } from './messages/persistFlags';
import { PersitFlag_Persist } from './messages/persistFlags';
import { PersitFlag_Transparent } from './messages/persistFlags';
import { PersitFlag_Persist_And_Count } from './messages/persistFlags';
import TipNotificationMessageContent from './messages/notification/tipNotificationMessageContent';
import UnknownMessageContent from './messages/unknownMessageContent';
import UnsupportMessageContent from './messages/unsupportMessageConten';

export function getMessageContentClazz(type) {
    for (const content of MessageContents) {
        if (content.type === type) {
            if (content.contentClazz) {
                return content.contentClazz;
            } else {
                return UnsupportMessageContent;
            }
        }
    }
    return UnknownMessageContent;
}

export const MessageContents = [
    {
        name: 'unknown',
        flag: PersitFlag_Persist,
        type: ContentType_Unknown,
        contentClazz: UnknownMessageContent,
    },
    {
        name: 'text',
        flag: PersitFlag_Persist_And_Count,
        type: ContentType_Text,
        contentClazz: TextMessageContent,
    },
    {
        name: 'voice',
        flag: PersitFlag_Persist_And_Count,
        type: ContentType_Voice,
    },
    {
        name: 'image',
        flag: PersitFlag_Persist_And_Count,
        type: ContentType_Image,
        contentClazz: ImageMessageContent,
    },
    {
        name: 'location',
        flag: PersitFlag_Persist_And_Count,
        type: ContentType_Location,
    },
    {
        name: 'file',
        flag: PersitFlag_Persist_And_Count,
        type: ContentType_File,
    },
    {
        name: 'video',
        flag: PersitFlag_Persist_And_Count,
        type: ContentType_Video,
    },
    {
        name: 'sticker',
        flag: PersitFlag_Persist_And_Count,
        type: ContentType_Sticker,
    },
    {
        name: 'imageText',
        flag: PersitFlag_Persist_And_Count,
        type: ContentType_ImageText,
    },
    {
        name: 'tip',
        flag: PersitFlag_Persist,
        type: ContentType_Tip_Notification,
        contentClazz: TipNotificationMessageContent,
    }
];