export default class MessageContentType {
    // 基本消息类型
    static Unknown = 0;
    static Text = 1;
    static Voice = 2;
    static Image = 3;
    static Location = 4;
    static File = 5;
    static Video = 6;
    static Sticker = 7;
    static ImageText = 8;
    static P_Text = 9;

    // 提醒消息
    static RecallMessage_Notification = 80;
    static Tip_Notification = 90;
    static Typing = 91;

    // 群相关消息
    static CreateGroup_Notification = 104;
    static AddGroupMember_Notification = 105;
    static KickOffGroupMember_Notification = 106;
    static QuitGroup_Notification = 107;
    static DismissGroup_Notification = 108;
    static TransferGroupOwner_Notification = 109;
    static ChangeGroupName_Notification = 110;
    static ModifyGroupAlias_Notification = 111;
    static ChangeGroupPortrait_Notification = 112;
    static MuteGroupMember_Notification = 113;
    static ChangeJoinType_Notification = 114;
    static ChangePrivateChat_Notification = 115;
    static ChangeSearchable_Notificaiton = 116;
    static SetGroupManager_Notification = 117;
    static VOIP_CONTENT_TYPE_START = 400;
    static VOIP_CONTENT_TYPE_END = 402;
    static VOIP_CONTENT_TYPE_ACCEPT = 401;
    static VOIP_CONTENT_TYPE_SIGNAL = 403;
    static VOIP_CONTENT_TYPE_MODIFY = 404;
    static VOIP_CONTENT_TYPE_ACCEPT_T = 405;
    static VOIP_CONTENT_TYPE_ADD_PARTICIPANT = 406;
    static VOIP_CONTENT_TYPE_MUTE_VIDEO = 407;

}
