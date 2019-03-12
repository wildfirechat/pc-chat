import TextMessageContent from './messages/textMessageContent'
import ImageMessageContent from './messages/imageMessageContent';

import {
    ContentType_Text,
    ContentType_Tip_Notification,
    ContentType_Unknown,
    ContenType_ChangeGroupName_Notification,
    ContenType_KickOffGroupMember_Notification,
    ContenType_AddGroupMember_Notification,
    ContenType_CreateGroupMember_Notification,
    ContenType_DismissGroup_Notification,
    ContenType_ModifyGroupAlias_Notification,
    ContenType_QuitGroup_Notification,
    ContenType_TransferGroupOwner_Notification,
    ContenType_ChangeGroupPortrait_Notification
} from './messages/messageTypes';

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
import TipNotificationMessageContent from './messages/notification/tipNotification';
import UnknownMessageContent from './messages/unknownMessageContent';
import UnsupportMessageContent from './messages/unsupportMessageConten';
import ChangeGroupNameNotification from './messages/notification/changeGroupNameNotification';
import KickoffGroupMemberNotification from './messages/notification/kickoffGroupMemberNotification';
import AddGroupMemberNotification from './messages/notification/addGroupMemberNotification';
import ChangeGroupPortraitNotification from './messages/notification/changeGroupPortraitNotification';
import CreateGroupNotification from './messages/notification/createGroupNotification';
import DismissGroupNotification from './messages/notification/dismissGroupNotification';
import ModifyGroupAliasNotification from './messages/notification/modifyGroupAliasNotification';
import QuitGroupNotification from './messages/notification/quitGroupNotification';
import TransferGroupOwnerNotification from './messages/notification/transferGroupOwnerNotification';

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

export function registerMessageContent(name, flag, type, clazz) {
    // TODO validate args

    MessageContents.push(
        {
            name: name,
            flag: flag,
            type: type,
            contentClazz: clazz,
        }
    );

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
    },
    {
        name: 'addGroupMemberNotification',
        flag: PersitFlag_Persist,
        type: ContenType_AddGroupMember_Notification,
        contentClazz: AddGroupMemberNotification,
    },
    {
        name: 'changeGroupNameNotification',
        flag: PersitFlag_Persist,
        type: ContenType_ChangeGroupName_Notification,
        contentClazz: ChangeGroupNameNotification,
    },
    {
        name: 'changeGroupPortraitNotification',
        flag: PersitFlag_Persist,
        type: ContenType_ChangeGroupPortrait_Notification,
        contentClazz: ChangeGroupPortraitNotification,
    },
    {
        name: 'createGroupNotification',
        flag: PersitFlag_Persist,
        type: ContenType_CreateGroupMember_Notification,
        contentClazz: CreateGroupNotification,
    },
    {
        name: 'dismissGroupNotification',
        flag: PersitFlag_Persist,
        type: ContenType_DismissGroup_Notification,
        contentClazz: DismissGroupNotification,
    },
    {
        name: 'kickoffGroupMemberNotification',
        flag: PersitFlag_Persist,
        type: ContenType_KickOffGroupMember_Notification,
        contentClazz: KickoffGroupMemberNotification,
    },
    {
        name: 'modifyGroupAliasNotification',
        flag: PersitFlag_Persist,
        type: ContenType_ModifyGroupAlias_Notification,
        contentClazz: ModifyGroupAliasNotification,
    },
    {
        name: 'quitGroupNotification',
        flag: PersitFlag_Persist,
        type: ContenType_QuitGroup_Notification,
        contentClazz: QuitGroupNotification,
    },
    {
        name: 'transferGroupOwnerNotification',
        flag: PersitFlag_Persist,
        type: ContenType_TransferGroupOwner_Notification,
        contentClazz: TransferGroupOwnerNotification,
    },
];