import TextMessageContent from '../messages/textMessageContent'
import PTextMessageContent from '../messages/ptextMessageContent'
import ImageMessageContent from '../messages/imageMessageContent';

import MessageContentType from '../messages/messageContentType';

import PersistFlag from '../messages/persistFlag';
import TipNotificationMessageContent from '../messages/notification/tipNotification';
import UnknownMessageContent from '../messages/unknownMessageContent';
import UnsupportMessageContent from '../messages/unsupportMessageConten';
import ChangeGroupNameNotification from '../messages/notification/changeGroupNameNotification';
import KickoffGroupMemberNotification from '../messages/notification/kickoffGroupMemberNotification';
import AddGroupMemberNotification from '../messages/notification/addGroupMemberNotification';
import ChangeGroupPortraitNotification from '../messages/notification/changeGroupPortraitNotification';
import CreateGroupNotification from '../messages/notification/createGroupNotification';
import DismissGroupNotification from '../messages/notification/dismissGroupNotification';
import ModifyGroupAliasNotification from '../messages/notification/modifyGroupAliasNotification';
import QuitGroupNotification from '../messages/notification/quitGroupNotification';
import TransferGroupOwnerNotification from '../messages/notification/transferGroupOwnerNotification';
import FileMessageContent from '../messages/fileMessageContent';
import VideoMessageContent from '../messages/videoMessageContent';
import StickerMessageContent from '../messages/stickerMessageContent';
import SoundMessageContent from '../messages/soundMessageContent';
import TypingMessageContent from '../messages/typingMessageContent';
import RecallMessageNotification from '../messages/notification/recallMessageNotification';

import CallStartMessageContent from '../av/messages/callStartMessageContent';
import CallAnswerMessageContent from '../av/messages/callAnswerMessageContent';
import CallAnswerTMessageContent from '../av/messages/callAnswerTMessageContent';
import CallByeMessageContent from '../av/messages/callByeMessageContent';
import CallSignalMessageContent from '../av/messages/callSignalMessageContent';
import CallModifyMessageContent from '../av/messages/callModifyMessageContent';
import AddParticipantsMessageContent from "../av/messages/addParticipantsMessageContent";
import MuteVideoMessageContent from "../av/messages/muteVideoMessageContent";
export default class MessageConfig {
    static getMessageContentClazz(type) {
        for (const content of MessageConfig.MessageContents) {
            if (content.type === type) {
                if (content.contentClazz) {
                    return content.contentClazz;
                } else {
                    return UnsupportMessageContent;
                }
            }
        }
        console.log(`message type ${type} is unknown`);
        return UnknownMessageContent;
    }

    static getMessageContentFlag(type) {
        let flag = PersistFlag.No_Persist;
        for (const content of MessageConfig.MessageContents) {
            if (content.type === type) {
                flag = content.flag;
            }
        }
        return flag;
    }
    static getMessageContentPersitFlag(type) {
        for (const content of MessageConfig.MessageContents) {
            if (content.type === type) {
                return content.flag;
            }
        }
        return 0;
    }

    static getMessageContentType(messageContent) {
        for (const content of MessageConfig.MessageContents) {
            if (content.contentClazz && messageContent instanceof content.contentClazz) {
                return content.type;
            }
        }

        return MessageContentType.Unknown;
    }

    static registerMessageContent(name, flag, type, clazz) {
        // TODO validate args

        MessageConfig.MessageContents.push(
            {
                name: name,
                flag: flag,
                type: type,
                contentClazz: clazz,
            }
        );

    }

    static MessageContents = [
        {
            name: 'unknown',
            flag: PersistFlag.Persist,
            type: MessageContentType.Unknown,
            contentClazz: UnknownMessageContent,
        },
        {
            name: 'text',
            flag: PersistFlag.Persist_And_Count,
            type: MessageContentType.Text,
            contentClazz: TextMessageContent,
        },
        {
            name: 'ptext',
            flag: PersistFlag.Persist,
            type: MessageContentType.P_Text,
            contentClazz: PTextMessageContent,
        },
        {
            name: 'voice',
            flag: PersistFlag.Persist_And_Count,
            type: MessageContentType.Voice,
            contentClazz: SoundMessageContent,
        },
        {
            name: 'image',
            flag: PersistFlag.Persist_And_Count,
            type: MessageContentType.Image,
            contentClazz: ImageMessageContent,
        },
        {
            name: 'location',
            flag: PersistFlag.Persist_And_Count,
            type: MessageContentType.Location,
        },
        {
            name: 'file',
            flag: PersistFlag.Persist_And_Count,
            type: MessageContentType.File,
            contentClazz: FileMessageContent,
        },
        {
            name: 'video',
            flag: PersistFlag.Persist_And_Count,
            type: MessageContentType.Video,
            contentClazz: VideoMessageContent,
        },
        {
            name: 'sticker',
            flag: PersistFlag.Persist_And_Count,
            type: MessageContentType.Sticker,
            contentClazz: StickerMessageContent,
        },
        {
            name: 'imageText',
            flag: PersistFlag.Persist_And_Count,
            type: MessageContentType.ImageText,
        },
        {
            name: 'tip',
            flag: PersistFlag.Persist,
            type: MessageContentType.Tip_Notification,
            contentClazz: TipNotificationMessageContent,
        },
        {
            name: 'typing',
            flag: PersistFlag.Transparent,
            type: MessageContentType.Typing,
            contentClazz: TypingMessageContent,
        },
        {
            name: 'addGroupMemberNotification',
            flag: PersistFlag.Persist,
            type: MessageContentType.AddGroupMember_Notification,
            contentClazz: AddGroupMemberNotification,
        },
        {
            name: 'changeGroupNameNotification',
            flag: PersistFlag.Persist,
            type: MessageContentType.ChangeGroupName_Notification,
            contentClazz: ChangeGroupNameNotification,
        },
        {
            name: 'changeGroupPortraitNotification',
            flag: PersistFlag.Persist,
            type: MessageContentType.ChangeGroupPortrait_Notification,
            contentClazz: ChangeGroupPortraitNotification,
        },
        {
            name: 'createGroupNotification',
            flag: PersistFlag.Persist,
            type: MessageContentType.CreateGroup_Notification,
            contentClazz: CreateGroupNotification,
        },
        {
            name: 'dismissGroupNotification',
            flag: PersistFlag.Persist,
            type: MessageContentType.DismissGroup_Notification,
            contentClazz: DismissGroupNotification,
        },
        {
            name: 'kickoffGroupMemberNotification',
            flag: PersistFlag.Persist,
            type: MessageContentType.KickOffGroupMember_Notification,
            contentClazz: KickoffGroupMemberNotification,
        },
        {
            name: 'modifyGroupAliasNotification',
            flag: PersistFlag.Persist,
            type: MessageContentType.ModifyGroupAlias_Notification,
            contentClazz: ModifyGroupAliasNotification,
        },
        {
            name: 'quitGroupNotification',
            flag: PersistFlag.Persist,
            type: MessageContentType.QuitGroup_Notification,
            contentClazz: QuitGroupNotification,
        },
        {
            name: 'transferGroupOwnerNotification',
            flag: PersistFlag.Persist,
            type: MessageContentType.TransferGroupOwner_Notification,
            contentClazz: TransferGroupOwnerNotification,
        },
        {
            name: 'recall',
            flag: PersistFlag.Persist,
            type: MessageContentType.RecallMessage_Notification,
            contentClazz: RecallMessageNotification,
        },
        {
            name: 'callStartMessageContent',
            flag: PersistFlag.Persist,
            type: MessageContentType.VOIP_CONTENT_TYPE_START,
            contentClazz: CallStartMessageContent,
        },
        {
            name: 'callAnswerMessageContent',
            flag: PersistFlag.No_Persist,
            type: MessageContentType.VOIP_CONTENT_TYPE_ACCEPT,
            contentClazz: CallAnswerMessageContent,
        },
        {
            name: 'callAnswerTMessageContent',
            flag: PersistFlag.Transparent,
            type: MessageContentType.VOIP_CONTENT_TYPE_ACCEPT_T,
            contentClazz: CallAnswerTMessageContent,
        },
        {
            name: 'callByeMessageContent',
            flag: PersistFlag.No_Persist,
            type: MessageContentType.VOIP_CONTENT_TYPE_END,
            contentClazz: CallByeMessageContent,
        },
        {
            name: 'callSignalMessageContent',
            flag: PersistFlag.Transparent,
            type: MessageContentType.VOIP_CONTENT_TYPE_SIGNAL,
            contentClazz: CallSignalMessageContent,
        },
        {
            name: 'callModifyMessageContent',
            flag: PersistFlag.No_Persist,
            type: MessageContentType.VOIP_CONTENT_TYPE_MODIFY,
            contentClazz: CallModifyMessageContent,
        },
        {
            name: 'callAddParticipant',
            flag: PersistFlag.Persist,
            type: MessageContentType.VOIP_CONTENT_TYPE_ADD_PARTICIPANT,
            contentClazz: AddParticipantsMessageContent,
        },
        {
            name: 'callMuteVideo',
            flag: PersistFlag.No_Persist,
            type: MessageContentType.VOIP_CONTENT_TYPE_MUTE_VIDEO,
            contentClazz: MuteVideoMessageContent,
        },
    ];
}
