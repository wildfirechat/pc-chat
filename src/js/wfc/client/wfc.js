import Conversation from '../model/conversation';
import {EventEmitter} from 'events';
import MessageStatus from '../messages/messageStatus';
import MessageContent from '../messages/messageContent';
import atob from 'atob';
import btoa from 'btoa';

import impl from '../proto/proto.min';
import Config from "../../config";
import avenginekit from "../av/avenginekitproxy";

// 其实就是imclient，后续可能需要改下名字
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

    getClientId() {
        return impl.getClientId();
    }

    getUserId() {
        return impl.getUserId();
    }

    getServerDeltaTime() {
        return impl.getServerDeltaTime();
    }

    screenShot() {
        return impl.screenShot();
    }

    isLogin() {
        return impl.isLogin();
    }

    getConnectionStatus() {
        return impl.getConnectionStatus();
    }

    getMyGroupList() {
        return impl.getMyGroupList();
    }

    getUserDisplayName(userId) {
        let userInfo = this.getUserInfo(userId, false);
        if (!userInfo) {
            return '<' + userId + '>';
        }
        return userInfo.friendAlias ? userInfo.friendAlias : (userInfo.displayName ? userInfo.displayName : '<' + userId + '>');
    }

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

    getUserInfo(userId, refresh = false, groupId = '') {
        let userInfo = impl.getUserInfo(userId, refresh, groupId);
        if (!userInfo.portrait) {
            userInfo.portrait = Config.DEFAULT_PORTRAIT_URL;
        }
        return userInfo;
    }

    getUserInfos(userIds, groupId) {
        let userInfos = impl.getUserInfos(userIds, groupId);
        userInfos.forEach((u) => {
            if (!u.portrait) {
                u.portrait = Config.DEFAULT_PORTRAIT_URL;
            }
        });
        return userInfos;
    }

    async searchUser(keyword, searchType, page, successCB, failCB) {
        impl.searchUser(keyword, searchType, page, successCB, failCB);
    }

    searchFriends(keyword) {
        return impl.searchFriends(keyword);
    }

    searchGroups(keyword) {
        return impl.searchGroups(keyword);
    }

    getIncommingFriendRequest() {
        return impl.getIncommingFriendRequest();
    }

    getOutgoingFriendRequest() {
        return impl.getOutgoingFriendRequest();
    }

    loadFriendRequestFromRemote() {
        impl.loadFriendRequestFromRemote();
    }

    getUnreadFriendRequestCount() {
        return impl.getUnreadFriendRequestCount();
    }

    clearUnreadFriendRequestStatus() {
        impl.clearUnreadFriendRequestStatus();
    }

    async deleteFriend(userId, successCB, failCB) {
        impl.deleteFriend(userId, successCB, failCB);
    }

    async handleFriendRequest(userId, accept, successCB, failCB) {
        impl.handleFriendRequest(userId, accept, successCB, failCB);
    }

    isBlackListed(userId) {
        return impl.isBlackListed(userId);
    }

    getBlackList() {
        return impl.getBlackList();
    }

    setBlackList(userId, block, successCB, failCB) {
        impl.setBlackList(userId, block, successCB, failCB);
    }

    getMyFriendList(fresh = false) {
        return impl.getMyFriendList(fresh);
    }

    getFriendAlias(userId) {
        return impl.getFriendAlias(userId);
    }

    async setFriendAlias(userId, alias, successCB, failCB) {
        impl.setFriendAlias(userId, alias, successCB, failCB);
    }

    async createGroup(groupId, groupType, name, portrait, memberIds = [], lines = [0], notifyContent, successCB, failCB) {
        impl.createGroup(groupId, groupType, name, portrait, memberIds, lines, notifyContent, successCB, failCB);
    }

    async setGroupManager(groupId, isSet, memberIds, lines, notifyContent, successCB, failCB) {
        impl.setGroupManager(groupId, isSet, memberIds, lines, notifyContent, successCB, failCB);
    }

    getGroupInfo(groupId, refresh = false) {
        return impl.getGroupInfo(groupId, refresh);
    }

    addGroupMembers(groupId, memberIds, notifyLines, notifyMessageContent, successCB, failCB) {
        impl.addGroupMembers(groupId, memberIds, notifyLines, notifyMessageContent, successCB, failCB);
    }

    getGroupMemberIds(groupId, fresh = false) {
        return impl.getGroupMemberIds(groupId, fresh);
    }

    getGroupMembers(groupId, fresh = false) {
        return impl.getGroupMembers(groupId, fresh);
    }

    getGroupMember(groupId, memberId) {
        return impl.getGroupMember(groupId, memberId);
    }

    kickoffGroupMembers(groupId, memberIds, notifyLines, notifyMsg, successCB, failCB) {
        impl.kickoffGroupMembers(groupId, memberIds, notifyLines, notifyMsg, successCB, failCB);
    }

    async quitGroup(groupId, lines, notifyMessageContent, successCB, failCB) {
        impl.quitGroup(groupId, lines, notifyMessageContent, successCB, failCB);
    }

    async dismissGroup(groupId, lines, notifyMessageContent, successCB, failCB) {
        impl.dismissGroup(groupId, lines, notifyMessageContent, successCB, failCB);
    }

    async modifyGroupInfo(groupId, type, newValue, lines, notifyMessageContent, successCB, failCB) {
        impl.modifyGroupInfo(groupId, type, newValue, lines, notifyMessageContent, successCB, failCB);
    }

    async modifyGroupAlias(groupId, alias, lines, notifyMessageContent, successCB, failCB) {
        impl.modifyGroupAlias(groupId, alias, lines, notifyMessageContent, successCB, failCB);
    }

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
