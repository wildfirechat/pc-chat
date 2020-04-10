export default class UserSettingScope {
    //不能直接使用，调用setConversation:silent:方法会使用到此值。
    static ConversationSilent = 1;
    static GlobalSilent = 2;
    //不能直接使用，调用setConversation:top:方法会使用到此值。
    static ConversationTop = 3;
    static HiddenNotificationDetail = 4;
    static GroupHideNickname = 5;
    static FavoriteGroup = 6;
    //不能直接使用，协议栈内会使用此值
    static Conversation_Sync = 7;
    //不能直接使用，协议栈内会使用此值
    static My_Channel = 8;
    //不能直接使用，协议栈内会使用此值
    static Listened_Channel = 9;
    static UserSettingPCOnline = 10;
    static UserSettingConversationReaded = 11;

    // 用户自定义的scope需从1000开始，以防冲突
    static kUserSettingCustomBegin = 1000;
}
