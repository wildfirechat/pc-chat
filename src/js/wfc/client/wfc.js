import Conversation from '../model/conversation';
import {EventEmitter} from 'events';
import MessageStatus from '../messages/messageStatus';
import MessageContent from '../messages/messageContent';
import atob from 'atob';
import btoa from 'btoa';

import impl from '../proto/proto.min';
import Config from "../../config";
import avenginekit from "../av/engine/avenginekitproxy";

export class WfcManager {

    eventEmitter = new EventEmitter();

    constructor() {
        impl.eventEmitter = this.eventEmitter;
    }

    registerMessageContent(name, flag, type, clazz) {
        impl.registerMessageContent(name, flag, type, clazz);
    }

    disconnect() {
        impl.disconnect();
    }

    /**
     * 获取clientId，获取用户token时，一定要通过调用此方法获取clientId，否则会连接失败。
     * @returns {string} clientId
     */
    getClientId() {
        return impl.getClientId();
    }

    /**
     * 获取当前用户的id
     * @returns {string} 当前用户的id
     */
    getUserId() {
        return impl.getUserId();
    }

    /**
     * 服务器时间和本地时间的差值
     * @returns {number} 服务器时间和本地时间的差值
     */
    getServerDeltaTime() {
        return impl.getServerDeltaTime();
    }

    /**
     * 截图，
     * @returns {string} 成功返回'done'，同时，图片保存到了系统剪贴板
     */
    screenShot() {
        return impl.screenShot();
    }

    /**
     * 是否成功登录
     * @returns {boolean}
     */
    isLogin() {
        return impl.isLogin();
    }

    /**
     * 获取连接状态
     * @returns {number} 连接状态，参考{@link ConnectionStatus}
     */
    getConnectionStatus() {
        return impl.getConnectionStatus();
    }

    /**
     * 获取我保存到通讯录的群组信息
     * @returns {array} 参考{@link GroupInfo}
     */
    getMyGroupList() {
        return impl.getMyGroupList();
    }

    /**
     * 获取用户的displayName
     * @param {string} userId 用户id
     * @returns {string} 用户displayName
     */
    getUserDisplayName(userId) {
        let userInfo = this.getUserInfo(userId, false);
        if (!userInfo) {
            return '<' + userId + '>';
        }
        return userInfo.friendAlias ? userInfo.friendAlias : (userInfo.displayName ? userInfo.displayName : '<' + userId + '>');
    }

    /**
     * 获取用户在群里面的displayName
     * @param {string} groupId 群id
     * @param {string} userId 用户id
     * @returns {string} 用户在群里面的displayName
     */
    getGroupMemberDisplayName(groupId, userId) {
        let userInfo = this.getUserInfo(userId, false, groupId);
        if (!userInfo) {
            return '<' + userId + '>';
        }

        return userInfo.groupAlias ? userInfo.groupAlias : (userInfo.friendAlias ? userInfo.friendAlias : (userInfo.displayName ? userInfo.displayName : '<' + userId + '>'))
    }

    getGroupMemberDisplayNameEx(userInfo) {
        return userInfo.groupAlias ? userInfo.groupAlias : (userInfo.friendAlias ? userInfo.friendAlias : (userInfo.displayName ? userInfo.displayName : '<' + userInfo.uid + '>'))
    }

    /**
     * 获取用户信息
     * @param {string} userId 用户id
     * @param {boolean} refresh 是否刷新用户信息，如果刷新的话，且用户信息有更新，会通过{@link eventEmitter}通知
     * @param {string} groupId
     * @returns {UserInfo}
     */
    getUserInfo(userId, refresh = false, groupId = '') {
        let userInfo = impl.getUserInfo(userId, refresh, groupId);
        if (!userInfo.portrait) {
            userInfo.portrait = Config.DEFAULT_PORTRAIT_URL;
        }
        return userInfo;
    }

    /**
     * 批量获取用户信息
     * @param {[string]} userIds 用户ids
     * @param {string} groupId 群组id
     * @returns {[UserInfo]}
     */
    getUserInfos(userIds, groupId) {
        let userInfos = impl.getUserInfos(userIds, groupId);
        userInfos.forEach((u) => {
            if (!u.portrait) {
                u.portrait = Config.DEFAULT_PORTRAIT_URL;
            }
        });
        return userInfos;
    }

    /**
     * 服务端搜索用户
     * @param {string} keyword 搜索关键字
     * @param {number} searchType 搜索类型，可选值如下:
     * <pre> <code>
     * General(0), // 模糊搜索displayName，精确搜索name或电话号码
     * NameOrMobile(1), //精确搜索name或电话号码
     * Name(2), //精确搜索name
     * Mobile(3) //精确搜索电话号码
     * </code>  </pre>
     * @param {number} page 页数，如果searchType是0，每次搜索20个，可以指定page。如果searchType非0，只能搜索一个，page无意义
     * @param {function ([UserInfo])} successCB
     * @param {function (number)}failCB
     * @returns {Promise<void>}
     */
    async searchUser(keyword, searchType, page, successCB, failCB) {
        impl.searchUser(keyword, searchType, page, successCB, failCB);
    }

    /**
     * 本地搜索好友
     * @param keyword 搜索关键字
     * @returns {[UserInfo]}
     */
    searchFriends(keyword) {
        return impl.searchFriends(keyword);
    }

    /**
     * 本地搜索群组
     * @param keyword 搜索关键字
     * @returns {[GroupInfo]}
     */
    searchGroups(keyword) {
        return impl.searchGroups(keyword);
    }

    /**
     * 获取收到的好友请求
     * @returns {[FriendRequest]}
     */
    getIncommingFriendRequest() {
        return impl.getIncommingFriendRequest();
    }

    /**
     * 获取发送出去的好友请求
     * @returns {[FriendRequest]}
     */
    getOutgoingFriendRequest() {
        return impl.getOutgoingFriendRequest();
    }

    /**
     * 从服务端加载好友请求，如果有更新，会通过{@link eventEmitter}通知
     */
    loadFriendRequestFromRemote() {
        impl.loadFriendRequestFromRemote();
    }

    /**
     * 获取未读的好友请求数
     * @returns {number}
     */
    getUnreadFriendRequestCount() {
        return impl.getUnreadFriendRequestCount();
    }

    /**
     * 清除好友请求未读状态
     */
    clearUnreadFriendRequestStatus() {
        impl.clearUnreadFriendRequestStatus();
    }

    /**
     * 删除好友
     * @param {string} userId 好友id
     * @param {function ()} successCB
     * @param {function (number) }failCB
     * @returns {Promise<void>}
     */
    async deleteFriend(userId, successCB, failCB) {
        impl.deleteFriend(userId, successCB, failCB);
    }

    /**
     * 处理好友请求
     * @param {string} userId 发送好友请求的用户的id
     * @param {boolean} accept true，接受好友请求；false，拒绝好友请求
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async handleFriendRequest(userId, accept, successCB, failCB) {
        impl.handleFriendRequest(userId, accept, successCB, failCB);
    }

    /**
     * 判断用户是否被加入了黑名单
     * @param userId
     * @returns {boolean}
     */
    isBlackListed(userId) {
        return impl.isBlackListed(userId);
    }

    /**
     * 获取黑名单
     * @returns {[string]}
     */
    getBlackList() {
        return impl.getBlackList();
    }

    /**
     * 设置黑名单
     * @param {string} userId 用户id
     * @param {boolean} block true，加入黑名单；false，移除黑名单
     * @param {function ()} successCB
     * @param {function (number)} failCB
     */
    setBlackList(userId, block, successCB, failCB) {
        impl.setBlackList(userId, block, successCB, failCB);
    }

    /**
     * 获取好友列表，返回的时好友id数组
     * @param {boolean} fresh 是否刷新好友信息，如果刷新，且有更新的话，会通过{@link eventEmitter}通知
     * @returns {[string]}
     */
    getMyFriendList(fresh = false) {
        return impl.getMyFriendList(fresh);
    }

    /**
     * 获取好友别名
     * @param {string} userId
     * @returns {string}
     */
    getFriendAlias(userId) {
        return impl.getFriendAlias(userId);
    }

    /**
     * 设置好友别名
     * @param {string} userId 用户id
     * @param {string} alias 别名
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async setFriendAlias(userId, alias, successCB, failCB) {
        impl.setFriendAlias(userId, alias, successCB, failCB);
    }

    /**
     * 创建群组
     * @param {string | null} groupId 群组id，一般情况下，传null；如果有自己的用户系统，自己维护群信息，那么可以传群id
     * @param {number} groupType 群类型，可参考 {@link GroupType }
     * @param {string} name 群名称
     * @param {string} portrait 群头像的链接
     * @param {[string]} memberIds 群成员id
     * @param {[number]} lines 会话线路，默认传[0]即可
     * @param {CreateGroupNotification} notifyContent 通知信息，默认传null，服务端会生成默认通知
     * @param {function (string)} successCB 回调通知群id
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async createGroup(groupId, groupType, name, portrait, memberIds = [], lines = [0], notifyContent, successCB, failCB) {
        impl.createGroup(groupId, groupType, name, portrait, memberIds, lines, notifyContent, successCB, failCB);
    }

    /**
     * 设置全管理员
     * @param {string} groupId 群id
     * @param {boolean} isSet true，设置；false，取消设置
     * @param {[string]} memberIds 将被设置为管理或取消管理远的群成员的用户id
     * @param {[number]} lines 默认传[0]即可
     * @param {TODO } notifyContent 默认传null即可
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async setGroupManager(groupId, isSet, memberIds, lines, notifyContent, successCB, failCB) {
        impl.setGroupManager(groupId, isSet, memberIds, lines, notifyContent, successCB, failCB);
    }

    /**
     * 获取群信息
     * @param groupId 群id
     * @param refresh 是否刷新，如果刷新，且有更新的话，会通过{@link eventEmitter}通知
     * @returns {GroupInfo}
     */
    getGroupInfo(groupId, refresh = false) {
        return impl.getGroupInfo(groupId, refresh);
    }

    /**
     * 添加群成员
     * @param  {string} groupId 群组id
     * @param {[string]} memberIds 新添加的群成员id
     * @param {[number]} notifyLines
     * @param {AddGroupMemberNotification} notifyMessageContent
     * @param successCB
     * @param failCB
     */
    addGroupMembers(groupId, memberIds, notifyLines, notifyMessageContent, successCB, failCB) {
        impl.addGroupMembers(groupId, memberIds, notifyLines, notifyMessageContent, successCB, failCB);
    }

    /**
     * 获取群成员id列表
     * @param {string} groupId 群id
     * @param {boolean} fresh 是否刷新，刷新时，如果有更新，会通过{@link eventEmitter}通知
     * @returns {[string]} 群成员用户id列表
     */
    getGroupMemberIds(groupId, fresh = false) {
        return impl.getGroupMemberIds(groupId, fresh);
    }

    /**
     * 获取群成员信息
     * @param {string} groupId 群id
     * @param {boolean} fresh 是否刷新
     * @returns {[GroupMember]} 群成员信息
     */
    getGroupMembers(groupId, fresh = false) {
        return impl.getGroupMembers(groupId, fresh);
    }

    /**
     * 获取单个群成员信息
     * @param {string} groupId 群id
     * @param {string} memberId 群成员id
     * @returns {GroupMember} 群成员信息
     */
    getGroupMember(groupId, memberId) {
        return impl.getGroupMember(groupId, memberId);
    }

    /**
     * 将用户从群里移除
     * @param {string} groupId 群id
     * @param {[string]} memberIds 将要被移除的群成员id列表
     * @param {[]} notifyLines 默认传[0]即可
     * @param {KickoffGroupMemberNotification} notifyMsg 默认传null即可
     * @param {function ()} successCB
     * @param {function (number)} failCB
     */
    kickoffGroupMembers(groupId, memberIds, notifyLines, notifyMsg, successCB, failCB) {
        impl.kickoffGroupMembers(groupId, memberIds, notifyLines, notifyMsg, successCB, failCB);
    }

    /**
     * 退出群组
     * @param groupId 群id
     * @param {[]} lines 默认传[0]即可
     * @param {KickoffGroupMemberNotification} notifyMessageContent 默认传null即可
     * @param successCB
     * @param failCB
     * @returns {Promise<void>}
     */
    async quitGroup(groupId, lines, notifyMessageContent, successCB, failCB) {
        impl.quitGroup(groupId, lines, notifyMessageContent, successCB, failCB);
    }

    /**
     * 解散群组
     * @param {string} groupId 群组id
     * @param {[]} lines 默认传[0]即可
     * @param {KickoffGroupMemberNotification} notifyMessageContent 默认传null即可
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async dismissGroup(groupId, lines, notifyMessageContent, successCB, failCB) {
        impl.dismissGroup(groupId, lines, notifyMessageContent, successCB, failCB);
    }

    /**
     * 修改群信息
     * @param {string} groupId 群id
     * @param {number} type 修改信息所属类型，可能的值如下：
     *    <pre><code>
     *    Modify_Group_Name(0),
     *    Modify_Group_Portrait(1),
     *    Modify_Group_Extra(2),
     *    Modify_Group_Mute(3),
     *    Modify_Group_JoinType(4),
     *    Modify_Group_PrivateChat(5),
     *    Modify_Group_Searchable(6);
     *    </code></pre>
     * @param {string} newValue 准备修改成什么
     * @param {[number]} lines
     * @param {GroupNotificationContent} notifyMessageContent
     * @param successCB
     * @param failCB
     * @returns {Promise<void>}
     */
    async modifyGroupInfo(groupId, type, newValue, lines, notifyMessageContent, successCB, failCB) {
        impl.modifyGroupInfo(groupId, type, newValue, lines, notifyMessageContent, successCB, failCB);
    }

    /**
     * 修改我在群组的别名
     * @param {string} groupId 群id
     * @param {string} alias 别名
     * @param lines
     * @param notifyMessageContent
     * @param successCB
     * @param failCB
     * @returns {Promise<void>}
     */
    async modifyGroupAlias(groupId, alias, lines, notifyMessageContent, successCB, failCB) {
        impl.modifyGroupAlias(groupId, alias, lines, notifyMessageContent, successCB, failCB);
    }

    /**
     * 转移群主
     * @param {string} groupId 群id
     * @param {string} newOwner 新群主的id
     * @param lines
     * @param notifyMessageContent
     * @param successCB
     * @param failCB
     */
    transferGroup(groupId, newOwner, lines, notifyMessageContent, successCB, failCB) {
        impl.transferGroup(groupId, newOwner, lines, notifyMessageContent, successCB, failCB);
    }

    getFavGroups() {
        return impl.getFavGroups();
    }

    isFavGroup(groupId) {
        return impl.isFavGroup(groupId);
    }

    async setFavGroup(groupId, fav, successCB, failCB) {
        impl.setFavGroup(groupId, fav, successCB, failCB);
    }

    getUserSetting(scope, key) {
        return impl.getUserSetting(scope, key);
    }

    getUserSettings(scope) {
        return impl.getUserSettings(scope);
    }

    async setUserSetting(scope, key, value, successCB, failCB) {
        impl.setUserSetting(scope, key, value, successCB, failCB);
    }

    modifyMyInfo(modifyMyInfoEntries, successCB, failCB) {
        impl.modifyMyInfo(modifyMyInfoEntries, successCB, failCB);
    }

    isGlobalSlient() {
        return impl.isGlobalSlient();
    }

    setGlobalSlient(silent, successCB, failCB) {
        impl.setGlobalSlient(silent, successCB, failCB);
    }

    isHiddenNotificationDetail() {
        return impl.isHiddenNotificationDetail();
    }

    async setHiddenNotificationDetail(hide, successCB, failCB) {
        impl.setHiddenNotificationDetail(hide, successCB, failCB);
    }

    isHiddenGroupMemberName(groupId) {
        return impl.isHiddenGroupMemberName(groupId);
    }

    async setHiddenGroupMemberName(groupId, hide, successCB, failCB) {
        impl.setHiddenGroupMemberName(groupId, hide, successCB, failCB);
    }

    async joinChatroom(chatroomId, successCB, failCB) {
        impl.joinChatroom(chatroomId, successCB, failCB);
    }

    async quitChatroom(chatroomId, successCB, failCB) {
        impl.quitChatroom(chatroomId, successCB, failCB);
    }

    async getChatroomInfo(chatroomId, updateDt, successCB, failCB) {
        return impl.getChatroomInfo(chatroomId, updateDt, successCB, failCB);
    }

    async getChatroomMemberInfo(chatroomId, maxCount, successCB, failCB) {
        impl.getChatroomMemberInfo(chatroomId, maxCount, successCB, failCB);
    }

    createChannel(name, portrait, status, desc, extra, successCB, failCB) {
        impl.createChannel(name, portrait, status, desc, extra, successCB, failCB);
    }

    getChannelInfo(channelId, refresh) {
        return impl.getChannelInfo(channelId, refresh);
    }

    async modifyChannelInfo(channelId, type, newValue, successCB, failCB) {
        impl.modifyChannelInfo(channelId, type, newValue, successCB, failCB);
    }

    searchChannel(keyword, successCB, failCB) {
        impl.searchChannel(keyword, successCB, failCB);
    }

    isListenedChannel(channelId) {
        return impl.isListenedChannel(channelId);
    }

    async listenChannel(channelId, listen, successCB, failCB) {
        impl.listenChannel(channelId, listen, successCB, failCB);
    }

    // return channelIds
    getMyChannels() {
        return impl.getMyChannels();
    }

    getListenedChannels() {
        return impl.getListenedChannels();
    }

    async destoryChannel(channelId, successCB, failCB) {
        impl.destoryChannel(channelId, successCB, failCB);
    }

    getConversationList(types, lines) {
        return impl.getConversationList(types, lines);
    }

    getConversationInfo(conversation) {
        return impl.getConversationInfo(conversation);
    }

    searchConversation(keyword, types = [], lines = []) {
        return impl.searchConversation(keyword, types, lines);
    }

    async removeConversation(conversation, clearMsg) {
        impl.removeConversation(conversation, clearMsg);
    }

    setConversationTop(conversation, top, successCB, failCB) {
        impl.setConversationTop(conversation, top, successCB, failCB);
    }

    setConversationSlient(conversation, silent, successCB, failCB) {
        impl.setConversationSlient(conversation, silent, successCB, failCB);
    }

    setConversationDraft(conversation, draft = '') {
        impl.setConversationDraft(conversation, draft);
    }

    getUnreadCount(types = [0, 1, 2], lines = [0]) {
        return impl.getUnreadCount(types, lines);
    }

    getConversationUnreadCount(conversation) {
        return impl.getConversationUnreadCount(conversation);
    }

    clearConversationUnreadStatus(conversation) {
        impl.clearConversationUnreadStatus(conversation);
    }

    clearAllUnreadStatus() {
        impl.clearAllUnreadStatus();
    }

    setMediaMessagePlayed(messageId) {
        impl.setMediaMessagePlayed(messageId);
    }

    isMyFriend(userId) {
        return impl.isMyFriend(userId);
    }

    async sendFriendRequest(userId, reason, successCB, failCB) {
        impl.sendFriendRequest(userId, reason, successCB, failCB);
    }

    /**
     *
     * @param {Conversation} conversation
     * @param {number} fromIndex
     * @param {boolean} before
     * @param {number} count
     * @param {string} withUser
     */
    getMessages(conversation, fromIndex, before = true, count = 20, withUser = '') {
        return impl.getMessages(conversation, fromIndex, before, count, withUser);
    }

    loadRemoteMessages(conversation, beforeUid, count, successCB, failCB) {
        impl.loadRemoteMessages(conversation, beforeUid, count, successCB, failCB);
    }

    getMessageById(messageId) {
        return impl.getMessageById(messageId);
    }

    getMessageByUid(messageUid) {
        return impl.getMessageByUid(messageUid);
    }

    searchMessage(conversation, keyword) {
        return impl.searchMessage(conversation, keyword);
    }

    async sendConversationMessage(conversation, messageContent, toUsers, preparedCB, progressCB, successCB, failCB) {
        impl.sendConversationMessage(conversation, messageContent, toUsers, preparedCB, progressCB, successCB, failCB);
    }

    async sendMessage(message, preparedCB, progressCB, successCB, failCB) {
        impl.sendMessage(message, preparedCB, progressCB, successCB, failCB);
    }

    // toUsers 用来实现定向消息
    async sendMessageEx(message, toUsers = [], preparedCB, progressCB, successCB, failCB) {
        impl.sendMessageEx(message, toUsers, preparedCB, progressCB, successCB, failCB);
    }

    // 更新了原始消息的内容
    async recallMessage(messageUid, successCB, failCB) {
        impl.recallMessage(messageUid, successCB, failCB);
    }

    deleteMessage(messageId) {
        return impl.deleteMessageById(messageId);
    }

    async clearMessages(conversation) {
        impl.clearMessages(conversation);
    }

    /**
     *
     * @param {Conversation} conversation
     * @param {MessageContent} messageContent
     * @param {MessageStatus} status
     * @param {boolean} notify 是否触发onReceiveMessage
     * @param {Number} serverTime 服务器时间，精度到毫秒
     */
    insertMessage(conversation, messageContent, status, notify = false, serverTime = 0) {
        impl.insertMessage(conversation, messageContent, status, notify, serverTime);
    }

    async updateMessageContent(messageId, messageContent) {
        impl.updateMessageContent(messageId, messageContent);
    }

    async uploadMedia(fileName, fileOrData, mediaType, successCB, failCB, progressCB) {
        impl.uploadMedia(fileName, fileOrData, mediaType, successCB, failCB, progressCB);
    }

    connect(userId, token) {
        impl.connect(userId, token);
    }

    _getStore() {
        return impl._getStore();
    }

    init(args = []) {
        impl.init(args);
        avenginekit.setup(self);
    }

    utf8_to_b64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    b64_to_utf8(str) {
        return decodeURIComponent(escape(atob(str)));
    }
}

const self = new WfcManager();
export default self;
