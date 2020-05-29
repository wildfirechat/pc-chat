import Conversation from '../model/conversation';
import {EventEmitter} from 'events';
import MessageStatus from '../messages/messageStatus';
import MessageContent from '../messages/messageContent';
import {atob, btoa }from '../util/base64.min.js';
import Long from 'long';

import impl from '../proto/proto.min';
import Config from "../../config";
import avenginekit from "../av/engine/avenginekitproxy";

export class WfcManager {

    /**
     * 事件通知，{@link EventType}中定义的事件，都会采用本{@link eventEmitter} 通知
     * @type {module:events.internal.EventEmitter}
     */
    eventEmitter = new EventEmitter();

    constructor() {
        impl.eventEmitter = this.eventEmitter;
    }

    /**
     * 注册新的自定义消息
     *
     * @param {string} name
     * @param {number} flag 用来标识本消息是否需要存储、计数等，{@link PersistFlag}
     * @param {number} type 消息类型，{@link MessageContentType}
     * @param {class} clazz 消息对应的class
     */
    registerMessageContent(name, flag, type, clazz) {
        impl.registerMessageContent(name, flag, type, clazz);
    }

    disconnect() {
        impl.disconnect();
    }

    /**
     * 获取host
     */
    getHost(){
        return impl.getHost();
    }

    /**
     * 获取clientId，获取用户token时，一定要通过调用此方法获取clientId，否则会连接失败。
     * @returns {string} clientId
     */
    getClientId() {
        return impl.getClientId();
    }

    getEncodedClientId(){
        return impl.getEncodedClientId();
    }

    /**
     *
     * @param {string} data 将要编码的数据
     * @returns {string} 编码结果，base64格式
     */
    encodeData(data){
        return impl.encodeData(data);
    }

    /**
     *
     * @param {string} encodedData 将要解码的数据，base64格式
     * @returns {null | string} 解码之后的数据
     */
    decodeData(encodedData){
        return impl.decodeData(encodedData);
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
     * 已废弃，请使用{@link getFavGroupList}
     * 获取我保存到通讯录的群组信息列表
     * @returns {[GroupInfo]} 参考{@link GroupInfo}
     */
    getMyGroupList() {
        return impl.getMyGroupList();
    }

    /**
     * 获取我保存到通讯录的群组信息列表
     * @returns {[GroupInfo]} 参考{@link GroupInfo}
     */
    getFavGroupList(){
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
     * @param {number} searchType 搜索类型，可选值参考{@link SearchType}
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
        impl.loadFriendRequestFromRemote(Long.ZERO);
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
     * @param {string} extra 一些额外信息，可用来实现好友来源等，推荐使用json格式
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async handleFriendRequest(userId, accept, extra, successCB, failCB) {
        impl.handleFriendRequest(userId, accept, extra, successCB, failCB);
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

    getFriendExtra(userId) {
        return impl.getFriendExtra(userId);
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
     * @param {number} type 修改信息所属类型，可选值参考{@link ModifyGroupInfoType}
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

    /**
     * 获取保存到通讯录的群id列表
     * @returns {[string]}
     */
    getFavGroups() {
        return impl.getFavGroups();
    }

    /**
     *  判断群是否保存到了通讯录
     * @param {string} groupId
     * @returns {boolean}
     */
     isFavGroup(groupId) {
        return impl.isFavGroup(groupId);
    }

     /**
     * 将群保存到通讯录或移除通讯录
     * @param {string} groupId 群id
     * @param {boolean} fav true，保存到通讯录；false，从通讯录移除
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async setFavGroup(groupId, fav, successCB, failCB) {
        impl.setFavGroup(groupId, fav, successCB, failCB);
    }

    /**
     * 获取用户设置，保存格式可以理解为：scope + key => value
     * @param {number} scope 命名空间，可选值参考{@link UserSettingScope}
     * @param {string} key key
     * @returns {string} 设置的key对应的value
     */
    getUserSetting(scope, key) {
        return impl.getUserSetting(scope, key);
    }

    /**
     * 获取某个命名空间下的所有设置
     * @param scope 命名空间，可选值参考{@link UserSettingScope}
     * @returns {Map} key-value
     */
    getUserSettings(scope) {
        return impl.getUserSettings(scope);
    }

    /**
     * 设置或更新用户设置
     * @param {number} scope 命名空间
     * @param {string} key 设置的key
     * @param {string} value 设置的value
     * @param {function ()} successCB 成功回调
     * @param {function (number)} failCB 失败回调
     * @returns {Promise<void>}
     */
    async setUserSetting(scope, key, value, successCB, failCB) {
        impl.setUserSetting(scope, key, value, successCB, failCB);
    }

    /**
     * 修改个人信息
     * @param {[ModifyMyInfoEntry]} modifyMyInfoEntries 需要修改的信息列表
     * @param successCB
     * @param failCB
     */
    modifyMyInfo(modifyMyInfoEntries, successCB, failCB) {
        impl.modifyMyInfo(modifyMyInfoEntries, successCB, failCB);
    }

    /**
     * 是否全局免打扰
     * @returns {boolean}
     */
    isGlobalSlient() {
        return impl.isGlobalSlient();
    }

    /**
     * 设置全局免打扰
     * @param {boolean} silent
     * @param {function ()} successCB
     * @param failCB
     */
    setGlobalSlient(silent, successCB, failCB) {
        impl.setGlobalSlient(silent, successCB, failCB);
    }

    /**
     * 是否隐藏通知详情
     * @returns {boolean}
     */
    isHiddenNotificationDetail() {
        return impl.isHiddenNotificationDetail();
    }

    /**
     * 设置或取消设置隐藏通知详情
     * @param {boolean} hide 是否隐藏通知详情
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async setHiddenNotificationDetail(hide, successCB, failCB) {
        impl.setHiddenNotificationDetail(hide, successCB, failCB);
    }

    /**
     * 是否隐藏群成员昵称
     * @param {string} groupId 群id
     * @returns {boolean}
     */
    isHiddenGroupMemberName(groupId) {
        return impl.isHiddenGroupMemberName(groupId);
    }

    /**
     * 设置或取消设置隐藏群成员昵称
     * @param {string} groupId 群id
     * @param {boolean} hide 是否隐藏
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async setHiddenGroupMemberName(groupId, hide, successCB, failCB) {
        impl.setHiddenGroupMemberName(groupId, hide, successCB, failCB);
    }

    /**
     * 加入聊天室
     * @param {string} chatroomId 聊天室id
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async joinChatroom(chatroomId, successCB, failCB) {
        impl.joinChatroom(chatroomId, successCB, failCB);
    }

    /**
     * 退出聊天室
     * @param {string} chatroomId 聊天室id
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async quitChatroom(chatroomId, successCB, failCB) {
        impl.quitChatroom(chatroomId, successCB, failCB);
    }

    /**
     * 获取聊天室信息
     * @param {string} chatroomId 聊天是id
     * @param {number} updateDt 传当前时间对应的毫秒数
     * @param {function (ChatRoomInfo)} successCB
     * @param failCB
     * @returns {Promise<void>}
     */
    async getChatroomInfo(chatroomId, updateDt, successCB, failCB) {
        return impl.getChatroomInfo(chatroomId, updateDt, successCB, failCB);
    }

    /**
     * 获取聊天室成员信息
     * @param {string} chatroomId 聊天室id
     * @param {number} maxCount 最多获取多少个聊天室成员信息
     * @param {function (ChatRoomMemberInfo)} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async getChatroomMemberInfo(chatroomId, maxCount, successCB, failCB) {
        impl.getChatroomMemberInfo(chatroomId, maxCount, successCB, failCB);
    }

    /**
     * 创建频道
     * @param {string} name 频道名称
     * @param {string} portrait 频道头像的链接地址
     * @param {number} status 频道的状态，可选值参考{@link ChannelStatus}
     * @param {string} desc 描述
     * @param {string} extra 额外信息
     * @param {function (string)} successCB 创建成功，会回调通知channelId
     * @param {function (number)} failCB
     */
    createChannel(name, portrait, status, desc, extra, successCB, failCB) {
        impl.createChannel(name, portrait, status, desc, extra, successCB, failCB);
    }

    /**
     * 获取频道信息
     * @param {string} channelId 频道id
     * @param {boolean} refresh 是否强制刷新
     * @returns {ChannelInfo|null}
     */
    getChannelInfo(channelId, refresh) {
        return impl.getChannelInfo(channelId, refresh);
    }

    /**
     * 修改频道信息
     * @param {string} channelId 频道id
     * @param {number} type 修改什么，可选值参考{@link ModifyChannelInfoType}
     * @param {string} newValue 修改后的值
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async modifyChannelInfo(channelId, type, newValue, successCB, failCB) {
        impl.modifyChannelInfo(channelId, type, newValue, successCB, failCB);
    }

    /**
     * 搜索频道
     * @param {string} keyword 关键字
     * @param {function ([ChannelInfo])} successCB
     * @param {function (number)} failCB
     */
    searchChannel(keyword, successCB, failCB) {
        impl.searchChannel(keyword, successCB, failCB);
    }

    /**
     * 是否已收听/关注某个频道
     * @param {string} channelId 频道id
     * @returns {boolean}
     */
    isListenedChannel(channelId) {
        return impl.isListenedChannel(channelId);
    }

    /**
     * 收听或取消收听频道
     * @param {string} channelId 频道id
     * @param {boolean} listen true，收听；false，取消收听
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async listenChannel(channelId, listen, successCB, failCB) {
        impl.listenChannel(channelId, listen, successCB, failCB);
    }

    /**
     * 获取自己创建的频道id列表
     * @returns {[string]}
     */
    getMyChannels() {
        return impl.getMyChannels();
    }

    /**
     * 获取所收听的频道id列表
     * @returns {[string]}
     */
    getListenedChannels() {
        return impl.getListenedChannels();
    }

    /**
     * 销毁频道
     * @param {string} channelId 频道id
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async destoryChannel(channelId, successCB, failCB) {
        impl.destoryChannel(channelId, successCB, failCB);
    }

    /**
     * 获取会话列表
     * @param {[number]} types 想获取的会话类型，可选值参考{@link ConversationType}
     * @param {[0]} lines 想获取哪些会话线路的会话，默认传[0]即可
     * @returns {[ConversationInfo]}
     */
    getConversationList(types, lines) {
        return impl.getConversationList(types, lines);
    }

    /**
     * 获取会话详情
     * @param {Conversation} conversation
     * @returns {ConversationInfo}
     */
    getConversationInfo(conversation) {
        return impl.getConversationInfo(conversation);
    }

    /**
     * 搜索会话
     * @param {string} keyword 关键字
     * @param {[ConversationType]} types 从哪些类型的会话中进行搜索，可选值可参考{@link ConversationType}
     * @param {[number]} lines 从哪些会话线路进行搜索，默认传[0]即可
     * @returns {[ConversationInfo]}
     */
    searchConversation(keyword, types = [], lines = []) {
        return impl.searchConversation(keyword, types, lines);
    }

    /**
     * 删除会话
     * @param {Conversation} conversation 想删除的目标会话
     * @param {boolean} clearMsg 是否已删除的会话的消息
     * @returns {Promise<void>}
     */
    async removeConversation(conversation, clearMsg) {
        impl.removeConversation(conversation, clearMsg);
    }

    /**
     * 会话置顶或取消置顶
     * @param {Conversation} conversation 需要置顶或取消置顶的会话
     * @param {boolean} top true，置顶；false，取消置顶
     * @param {function ()} successCB
     * @param {function (number)} failCB
     */
    setConversationTop(conversation, top, successCB, failCB) {
        impl.setConversationTop(conversation, top, successCB, failCB);
    }

    /**
     * 会话免打扰或取消免打扰
     * @param {Conversation} conversation 目标会话
     * @param {boolean} silent true，设置为免打扰；false，取消免打扰
     * @param {function ()} successCB
     * @param {function (number)} failCB
     */
    setConversationSlient(conversation, silent, successCB, failCB) {
        impl.setConversationSlient(conversation, silent, successCB, failCB);
    }

    /**
     * 保存会话草稿
     * @param {Conversation} conversation 目标会话
     * @param {string} draft 草稿，传''时，相当于清楚会话草稿
     */
    setConversationDraft(conversation, draft = '') {
        impl.setConversationDraft(conversation, draft);
    }

    /**
     * 设置会话时间错，当会话不存在时，会创建一个新的会话。
     * @param {Conversation} conversation
     * @param {number} timestamp
     */
    setConversationTimestamp(conversation, timestamp){
        impl.setConversationTimestamp(conversation, timestamp);
    }

    /**
     * 获取未读消息数
     * @param {[number]} types 获取未读数时，包含哪些类型的会话，可选值参考{@link ConversationType}
     * @param {[number]} lines 获取未读数时，包含哪些会话线路，默认传[0]即可
     * @returns {UnreadCount}
     */
    getUnreadCount(types = [0, 1, 2], lines = [0]) {
        return impl.getUnreadCount(types, lines);
    }

    /**
     * 获取某个会话的未读消息数
     * @param {Conversation} conversation 目标会话
     * @returns {UnreadCount}
     */
    getConversationUnreadCount(conversation) {
        return impl.getConversationUnreadCount(conversation);
    }

    /**
     * 清楚会话消息未读状态
     * @param {Conversation} conversation 目标会话
     */
    clearConversationUnreadStatus(conversation) {
        impl.clearConversationUnreadStatus(conversation);
    }

    /**
     * 清楚所有消息的未读状态
     */
    clearAllUnreadStatus() {
        impl.clearAllUnreadStatus();
    }

    /**
     * 设置媒体消息的状态为已播放
     * @param {number} messageId 消息id，不是消息uid!
     */
    setMediaMessagePlayed(messageId) {
        impl.setMediaMessagePlayed(messageId);
    }

    /**
     * 判断是否是好友
     * @param {string} userId 用户id
     * @returns {boolean}
     */
    isMyFriend(userId) {
        return impl.isMyFriend(userId);
    }

    /**
     * 发送好友请求
     * @param {string} userId 目标用户id
     * @param {string} reason 发送好友请求的原因
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async sendFriendRequest(userId, reason, successCB, failCB) {
        impl.sendFriendRequest(userId, reason, successCB, failCB);
    }

    /**
     * 获取会话消息
     * @param {Conversation} conversation 目标会话
     * @param {number} fromIndex messageId，表示从那一条消息开始获取
     * @param {boolean} before  true, 获取fromIndex之前的消息，即更旧的消息；false，获取fromIndex之后的消息，即更新的消息。都不包含fromIndex对应的消息
     * @param {number} count 获取多少条消息
     * @param {string} withUser 只有会话类型为{@link ConversationType#Channel}时生效, channel主用来查询和某个用户的所有消息
     * @return
     */
    getMessages(conversation, fromIndex, before = true, count = 20, withUser = '') {
        return impl.getMessages(conversation, fromIndex, before, count, withUser);
    }

    /**
     * 加载远程历史消息
     * @param {Conversation} conversation 目标会话
     * @param {number} beforeUid 消息uid，表示拉取本条消息之前的消息
     * @param {number} count
     * @param {function (Message)} successCB
     * @param failCB
     */
    loadRemoteMessages(conversation, beforeUid, count, successCB, failCB) {
        impl.loadRemoteMessages(conversation, beforeUid, count, successCB, failCB);
    }

    /**
     * 获取会话的远程历史消息
     * @param {Conversation} conversation 目标会话
     * @param {number | Long} beforeUid 消息uid，表示拉取本条消息之前的消息
     * @param {number} count
     * @param {function (Message)} successCB
     * @param failCB
     */
     loadRemoteConversationMessages(conversation, beforeUid, count, successCB, failCB) {
        impl.loadRemoteMessages(conversation, beforeUid, count, successCB, failCB);
    }

    /**
     * 根据会话线路，获取远程历史消息
     * @param {number} line 会话线路
     * @param {number | Long} beforeUid 消息uid，表示拉取本条消息之前的消息
     * @param {number} count
     * @param {function (Message)} successCB
     * @param failCB
     */
    loadRemoteLineMessages(line, beforeUid, count, successCB, failCB){
        impl.loadRemoteLineMessages(line, beforeUid, count, successCB, failCB)
    }

    /**
     * 获取消息
     * @param {number} messageId 消息id
     * @returns {null|Message}
     */
    getMessageById(messageId) {
        return impl.getMessageById(messageId);
    }

    /**
     * 获取消息
     * @param {Long|string|number} messageUid
     * @returns {null|Message}
     */
    getMessageByUid(messageUid) {
        return impl.getMessageByUid(messageUid);
    }

    /**
     * 搜索消息
     * @param {Conversation} conversation 目标会话
     * @param {string} keyword 关键字
     * @returns {[Message]}
     */
    searchMessage(conversation, keyword) {
        return impl.searchMessage(conversation, keyword);
    }

    /**
     * 发送消息
     * @param {Conversation} conversation 目标会话
     * @param {MessageContent} messageContent 具体的消息内容，一定要求是{@link MessageContent} 的子类，不能是普通的object
     * @param {[string]} toUsers 定向发送给会话中的某些用户；为空，则发给所有人；另外对单聊会话，本参数无效
     * @param {function (number, number)} preparedCB 消息已插入本地数据的回调，回调的两个参数表示：messageId, timestamp
     * @param {function (number, number)} progressCB 媒体上传进度回调，针对媒体消息，且媒体大于100K时有效，回调参数表示：uploaded, total
     * @param {function (number, number)} successCB 发送成功回调，回调参数表示：messageUid, timestamp
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async sendConversationMessage(conversation, messageContent, toUsers, preparedCB, progressCB, successCB, failCB) {
        impl.sendConversationMessage(conversation, messageContent, toUsers, preparedCB, progressCB, successCB, failCB);
    }

    /**
     * 发送消息，参考{@link sendConversationMessage}
     * @param {Message} message 一定要求是{@link Message}类型
     * @param preparedCB
     * @param progressCB
     * @param successCB
     * @param failCB
     * @returns {Promise<void>}
     */
    async sendMessage(message, preparedCB, progressCB, successCB, failCB) {
        impl.sendMessage(message, preparedCB, progressCB, successCB, failCB);
    }

    /**
     * 发送消息，参考{@link sendMessage}
     * @param message
     * @param toUsers
     * @param preparedCB
     * @param progressCB
     * @param successCB
     * @param failCB
     * @returns {Promise<void>}
     */
    async sendMessageEx(message, toUsers = [], preparedCB, progressCB, successCB, failCB) {
        impl.sendMessageEx(message, toUsers, preparedCB, progressCB, successCB, failCB);
    }

    // 更新了原始消息的内容
    /**
     * 撤回消息
     * @param {Long} messageUid
     * @param {function ()} successCB
     * @param {function (number)} failCB
     * @returns {Promise<void>}
     */
    async recallMessage(messageUid, successCB, failCB) {
        impl.recallMessage(messageUid, successCB, failCB);
    }

    /**
     * 删除消息
     * @param {number} messageId 消息id
     * @returns {*}
     */
    deleteMessage(messageId) {
        return impl.deleteMessageById(messageId);
    }

    /**
     * 清除会话消息
     * @param {Conversation} conversation 目标会话
     * @returns {Promise<void>}
     */
    async clearMessages(conversation) {
        impl.clearMessages(conversation);
    }

    /**
     * 插入消息
     * @param {Conversation} conversation 目标会话
     * @param {MessageContent} messageContent 具体的消息内容，一定要求是{@link MessageContent} 的子类，不能是普通的object
     * @param {number} status 消息状态，可选值参考{@link MessageStatus}
     * @param {boolean} notify 是否触发onReceiveMessage
     * @param {Number} serverTime 服务器时间，精度到毫秒
     */
    insertMessage(conversation, messageContent, status, notify = false, serverTime = 0) {
        impl.insertMessage(conversation, messageContent, status, notify, serverTime);
    }

    /**
     * 更新消息
     * @param {number} messageId 消息id
     * @param {MessageContent} messageContent 具体的消息内容，一定要求是{@link MessageContent} 的子类，不能是普通的object
     * @returns {Promise<void>}
     */
    async updateMessageContent(messageId, messageContent) {
        impl.updateMessageContent(messageId, messageContent);
    }

    /**
     * 删除媒体文件
     * @param {string} fileName
     * @param {string} fileOrData base64格式的dataUri
     * @param {number} mediaType 媒体类型，可选值参考{@link MessageContentMediaType}
     * @param {function (string)} successCB 回调通知上传成功之后的url
     * @param {function (number)} failCB
     * @param {function (number, number)} progressCB
     * @returns {Promise<void>}
     */
    async uploadMedia(fileName, fileOrData, mediaType, successCB, failCB, progressCB) {
        impl.uploadMedia(fileName, fileOrData, mediaType, successCB, failCB, progressCB);
    }

    /**
     * 连接服务器
     * @param {string} userId 用户id
     * @param {string} token 用户token，生成token时，所使用的clientId，一定要通过{@link getClientId}获取
     */
    connect(userId, token) {
        impl.connect(userId, token);
    }

   /**
     *
     * 是否开启了已送达报告和已读报告功能
     * @return {boolean}
     */
    isReceiptEnabled(){
        return impl.isReceiptEnabled();
    }

    /**
     *
     * @param conversation
     * @return {Map<string, Number>}
     */
    getConversationDelivery(conversation){
        return impl.getConversationDelivery(conversation);
    }

    /**
     *
     * @param conversation
     * @return {Map<string, Number>}
     */
    getConversationRead(conversation){
        return impl.getConversationRead(conversation);
    }
    _getStore() {
        return impl._getStore();
    }

    /**
     * 初始化，请参考本demo的用法
     * @param {[]} args 请参考本demo的用法，第一个参数必须为marswrapper.node导出的对象
     */
    init(args = []) {
        impl.init(args);
        avenginekit.setup(self);
    }

    /**
     * utf8转base64
     * @param {string} str
     * @returns {string}
     */
    utf8_to_b64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    /**
     * base64转utf8
     * @param {string} str
     * @returns {string}
     */
    b64_to_utf8(str) {
        return decodeURIComponent(escape(atob(str)));
    }
}

const self = new WfcManager();
export default self;
