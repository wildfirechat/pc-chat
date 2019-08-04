// import proto from 'node-loader!../../../marswrapper.node';
import Message from '../wfc/messages/message';
import Conversation from '../wfc/model/conversation';
import ConversationInfo from '../wfc/model/conversationInfo';
import { EventEmitter } from 'events';
import EventType from './wfcEvent'
import UserInfo from '../wfc/model/userInfo';
import NullUserInfo from '../wfc/model/nullUserInfo';
import NullGroupInfo from './model/nullGroupInfo';
import GroupInfo from './model/groupInfo';
import GroupMember from './model/groupMember';
import { UserSettingScope } from './userSettingScope';
import CreateGroupNotification from './messages/notification/createGroupNotification';
import MessageContentMediaType from './messages/messageContentMediaType';
import AddGroupMemberNotification from './messages/notification/addGroupMemberNotification';
import MessageConfig from './messageConfig';
import UnreadCount from './model/unreadCount';
import ConversationSearchResult from './model/conversationSearchResult';
import MessageStatus from './messages/messageStatus';
import MessageContent from './messages/messageContent';
import GroupSearchResult from './model/groupSearchResult';
import FriendRequest from './model/friendRequest';
import ChatRoomMemberInfo from './model/chatRoomMemberInfo';
import ChannelInfo from './model/channelInfo';
import ConversationType from './model/conversationType';
import TextMessageContent from './messages/textMessageContent';
import ConnectionStatus from './connectionStatus';
var proto = null;

// 其实就是imclient，后续可能需要改下名字
class WfcManager {
    connectionStatus = 0;
    userId = '';
    token = '';
    users = new Map();
    groups = new Map();
    isLogined = false;

    // TODO 移除吧，全都走EventEmitter
    // onReceiveMessageListeners = [];

    messageContentList = new Map();

    eventEmitter = new EventEmitter();

    onConnectionChanged(status) {
        if (!self.isLogined && status == ConnectionStatus.ConnectionStatusConnected) {
            self.isLogined = true;
        }
        self.connectionStatus = status;
        self.eventEmitter.emit(EventType.ConnectionStatusChanged, status);
        console.log('connection status changed', status);
    }

    // /**
    //  * 
    //  * @param {function} listener 
    //  */
    // setOnReceiveMessageListener(listener) {
    //     if (typeof listener !== 'function') {
    //         console.log('listener should be a function');
    //         return;
    //     }
    //     self.onReceiveMessageListeners.forEach(l => {
    //         l === listener
    //         return
    //     });
    //     self.onReceiveMessageListeners.push(listener);
    // }

    // removeOnReceiMessageListener(listener) {
    //     if (typeof listener !== 'function') {
    //         console.log('listener should be a function');
    //         return;
    //     }
    //     self.onReceiveMessageListeners.splice(self.onReceiveMessageListeners.indexOf(listener), 1);
    // }

    onReceiveMessage(messages, hasMore) {
      if (!self.isLogined) {
        return;
      }
        // receiving
        if (self.connectionStatus === 2) {
            return;
        }
        var msgs = JSON.parse(messages);
        msgs.forEach(m => {
            let msg = Message.fromProtoMessage(m);
            // self.onReceiveMessageListeners.forEach(listener => {
            //     listener(msg, hasMore);
            // });
            if (msg) {
                self.eventEmitter.emit(EventType.ReceiveMessage, msg);
            }
        });
    }

    onGroupInfoUpdate(groupListIds) {
      if (!self.isLogined) {
        return;
      }

        let groupIdArray = JSON.parse(groupListIds);

        groupIdArray.forEach((groupId => {
            self.groups.delete(groupId);
            self.eventEmitter.emit(EventType.GroupInfoUpdate, groupId);
        }))
    }

    onChannelInfoUpdate(channelListIds) {
        // TODO
        if (!self.isLogined) {
          return;
        }
    }

    onSettingUpdate() {
      if (!self.isLogined) {
        return;
      }
        // TODO 具体更新的信息
        self.eventEmitter.emit(EventType.SettingUpdate);
    }

    onRecallMessage(operatorUid, messageUid) {
      if (!self.isLogined) {
        return;
      }
        self.eventEmitter.emit(EventType.RecallMessage, operatorUid, messageUid);
    }

    onMessageDeleted(messageId) {
      if (!self.isLogined) {
        return;
      }
        self.eventEmitter.emit(EventType.DeleteMessage, messageId);
    }

    onUserInfoUpdate(userIds) {
      if (!self.isLogined) {
        return;
      }
        let userIdArray = JSON.parse(userIds);

        userIdArray.forEach((userId => {
            self.users.delete(userId);
            self.eventEmitter.emit(EventType.UserInfoUpdate, userId);
        }))
    }

    onFriendListUpdate(friendListIds) {
      if (!self.isLogined) {
        return;
      }
        console.log('friendList update, ids', friendListIds);
        let ids = JSON.parse(friendListIds);
        ids.forEach((uid) => {
            self.users.delete(uid);
        });
        self.eventEmitter.emit(EventType.FriendListUpdate, friendListIds);
    }

    onFriendRequestUpdate() {
        // TODO
        if (!self.isLogined) {
          return;
        }
    }

    init() {
        proto = self.proto;
        // if(process.platform === 'win32'){
        //     proto.setDBPath(process.cwd());
        // }
        proto.setConnectionStatusListener(self.onConnectionChanged);
        proto.setReceiveMessageListener(self.onReceiveMessage, self.onRecallMessage);
        proto.setUserInfoUpdateListener(self.onUserInfoUpdate);
        proto.setFriendUpdateListener(self.onFriendListUpdate);
        proto.setFriendRequestListener(self.onFriendRequestUpdate);
        proto.setGroupInfoUpdateListener(self.onGroupInfoUpdate);
        proto.setSettingUpdateListener(self.onSettingUpdate);
        proto.setChannelInfoUpdateListener(self.onChannelInfoUpdate);
        self.registerDefaultMessageContents();
    }

    /**
     * 
     * @param {messagecontent} content 
     */
    registerMessageContent(type, content) {
        self.messageContentList[type] = content;
    }

    async connect(userId, token) {
        self.userId = userId;
        proto.connect(userId, token);

        // for testing your code
        // self.test();
    }

    disconnect() {
        self.userId = '';
        proto.disconnect(0);


        //sleep 1 second wait disconnect with im server
        var now = new Date();
        var exitTime = now.getTime() + 1000;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime)
                return;
        }
    }

    registerDefaultMessageContents() {
        MessageConfig.MessageContents.map((e) => {
            proto.registerMessageFlag(e.type, e.flag);
            self.registerMessageContent(e.type, e.content);
        });
    }

    getClientId() {
        return proto.getClientId();
    }

    getUserId() {
        return self.userId;
    }

    getServerDeltaTime() {
        return proto.getServerDeltaTime();
    }

    isLogin() {
        // return proto.isLogin();
        return self.isLogined;
    }

    getConnectionStatus() {
        return proto.getConnectionStatus();
    }



    getMyGroupList() {
        let str = proto.getUserSettings(UserSettingScope.FavoriteGroup);
        let arr = JSON.parse(str);
        var groupList = [];
        arr.map(e => {
            if (e['value'] === '1') {
                groupList.push(e['key']);
            }
        });
        return groupList;
    }

    /**
     * @param {string} userId 
     * @param {bool} fresh 
     */
    getUserInfo(userId, fresh = false) {
        if (!userId || userId === '') {
            return new NullUserInfo('');
        }
        let userInfo;
        if (!fresh) {
            userInfo = self.users.get(userId);
            if (userInfo) {
                return userInfo;
            }
        }

        console.log('getuserInfo', userId);
        let userInfoStr = proto.getUserInfo(userId, fresh);
        if (userInfoStr === '') {
            userInfo = new NullUserInfo(userId);
        } else {
            userInfo = Object.assign(new UserInfo(), JSON.parse(userInfoStr));
        }
        self.users.set(userInfo.uid, userInfo);
        return userInfo;
    }

    async searchUser(keyword, successCB, failCB) {
        proto.searchUser(keyword, (result) => {
            let userListStr = JSON.parse(result);
            let userList = [];
            if (userListStr && userListStr.length > 0) {
                userListStr.forEach(u => {
                    userList.push(Object.assign(new UserInfo(), u));
                });
            }
            if (successCB) {
                successCB(userList);
            }
        }, (errorCode) => {
            if (errorCode) {
                failCB(errorCode);
            }

        });
    }

    searchFriends(keyword) {
        let result = proto.searchFriends(keyword);
        let userListStr = JSON.parse(result);
        let userList = [];
        if (userListStr && userListStr.length > 0) {
            userListStr.forEach(u => {
                userList.push(Object.assign(new UserInfo(), u));
            });
        }
        return userList;
    }

    searchGroups(keyword) {
        let result = proto.searchGroups(keyword);
        let groupSearchResultListStr = JSON.parse(result);
        let groupSearchResultList = [];
        if (groupSearchResultListStr && groupSearchResultListStr.length > 0) {
            groupSearchResultListStr.forEach(g => {
                groupSearchResultList.push(GroupSearchResult.fromProtoGroupSearchResult(g));
            });
        }
        return groupSearchResultList;
    }

    getIncommingFriendRequest() {
        let result = proto.getIncommingFriendRequest();
        let friendRequestListStr = JSON.parse(result);
        let firendRequestList = [];
        if (friendRequestListStr && friendRequestListStr.length > 0) {
            friendRequestListStr.forEach((r) => {
                firendRequestList.push(Object.assign(new FriendRequest(), r));
            });
        }
        return firendRequestList;
    }

    getOutgoingFriendRequest() {
        let result = proto.getOutgoingFriendRequest();
        let friendRequestListStr = JSON.parse(result);
        let firendRequestList = [];
        if (friendRequestListStr && friendRequestListStr.length > 0) {
            friendRequestListStr.forEach((r) => {
                firendRequestList.push(Object.assign(new FriendRequest(), r));
            });
        }
        return firendRequestList;
    }

    loadFriendRequestFromRemote() {
        proto.loadFriendRequestFromRemote();
    }

    getUnreadFriendRequestCount() {
        return proto.getUnreadFriendRequestStatus();
    }

    clearUnreadFriendRequestStatus() {
        proto.clearUnreadFriendRequestStatus();
    }

    async deleteFriend(userId, successCB, failCB) {
        proto.deleteFriend(userId, () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            failCB(errorCode);
        });
    }

    async handleFriendRequest(userId, accept, successCB, failCB) {
        proto.handleFriendRequest(userId, accept, () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }

        });
    }

    isBlackListed(userId) {
        return proto.isBlackListed(userId);
    }

    getBlackList() {
        let result = proto.getBlackList();
        return JSON.parse(result);
    }

    setBlackList(userId, block, successCB, failCB) {
        proto.setBlackList(userId, block, () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    getMyFriendList(fresh = false) {
        let idsStr = proto.getMyFriendList(fresh);
        if (idsStr !== '') {
            return JSON.parse(idsStr);
        }
        return [];
    }

    async createGroup(groupId, name, portrait, memberIds = [], lines = [0], notifyContent, successCB, failCB) {
        groupId = !groupId ? '' : groupId;
        let myUid = self.getUserId();

        if (!notifyContent) {
            notifyContent = new CreateGroupNotification(myUid, name);
        }

        if (!memberIds.includes(myUid)) {
            memberIds.push(myUid);
        }

        let payload = notifyContent.encode();
        let notifyContentStr = JSON.stringify(payload);
        proto.createGroup(groupId, name, portrait, memberIds, lines, notifyContentStr,
            (groupId) => {
                if (successCB) {
                    successCB(groupId);
                }
            },
            (errorCode) => {
                if (failCB) {
                    failCB();
                }
            });
    }

    getGroupInfo(groupId, fresh = false) {
        let groupInfo;
        if (!fresh) {
            groupInfo = self.groups.get(groupId);
            if (groupInfo) {
                return groupInfo;
            }
        }

        console.log('get groupInfo', groupId, fresh);
        let groupInfoStr = proto.getGroupInfo(groupId, fresh);
        if (groupInfoStr === '') {
            return new NullGroupInfo(groupId);
        } else {
            groupInfo = Object.assign(new GroupInfo(), JSON.parse(groupInfoStr));
            self.groups.set(groupId, groupInfo);
            return groupInfo;
        }
    }

    addGroupMembers(groupId, memberIds, notifyLines, notifyMessageContent, successCB, failCB) {
        if (!notifyMessageContent) {
            notifyMessageContent = new AddGroupMemberNotification(self.getUserId(), memberIds);
        }
        let payload = notifyMessageContent.encode();
        let notifyContentStr = JSON.stringify(payload);
        proto.addMembers(memberIds, groupId, notifyLines, notifyContentStr,
            () => {
                if (successCB) {
                    successCB();
                }
            },
            (errorCode) => {
                if (failCB) {
                    failCB(errorCode);
                }
            });
    }

    getGroupMemberIds(groupId, fresh = false) {
        let groupMembers = self.getGroupMembers(groupId, fresh);
        var groupMemberIds = [];
        groupMembers.forEach(e => {
            groupMemberIds.push(e.memberId);
        });
        return groupMemberIds;
    }

    getGroupMembers(groupId, fresh = false) {
        let memberIdsStr = proto.getGroupMembers(groupId, fresh);
        var members = [];
        let arr = JSON.parse(memberIdsStr);
        arr.forEach(e => {
            members.push(Object.assign(new GroupMember(), e));
        });
        return members;
    }

    getGroupMember(groupId, memberId) {
        let result = proto.getGroupMember(groupId, memberId);
        return Object.assign(new GroupMember(), JSON.parse(result));
    }

    kickoffGroupMembers(groupId, memberIds, notifyLines, notifyMsg, successCB, failCB) {
        let payload = notifyMsg.encode();
        let strCont = JSON.stringify(payload);
        proto.kickoffMembers(groupId, memberIds, notifyLines, strCont,
            () => {
                if (successCB) {
                    successCB();
                }

            }, (errorCode) => {
                if (failCB) {
                    failCB(errorCode);
                }
            });
    }

    async quitGroup(groupId, lines, notifyMessageContent, successCB, failCB) {
        let payload = notifyMessageContent.encode();
        proto.quitGroup(groupId, lines, JSON.stringify(payload), () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            failCB(errorCode);
        });
    }

    async dismissGroup(groupId, lines, notifyMessageContent, successCB, failCB) {
        let payload = notifyMessageContent.encode();
        proto.dismissGroup(groupId, lines, JSON.stringify(payload), () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            failCB(errorCode);
        });
    }

    async modifyGroupInfo(groupId, type, newValue, lines, notifyMessageContent, successCB, failCB) {
        let payload = notifyMessageContent.encode();
        proto.modifyGroupInfo(groupId, type, newValue, lines, JSON.stringify(payload),
            () => {
                if (successCB) {
                    successCB();
                }
            }, (errorCode) => {
                if (failCB) {
                    failCB(errorCode);
                }
            });
    }

    async modifyGroupAlias(groupId, alias, lines, notifyMessageContent, successCB, failCB) {
        let payload = notifyMessageContent.encode();
        proto.modifyGroupAlias(groupId, alias, lines, JSON.stringify(payload), () => {
            successCB();
        }, (errorCode) => {
            failCB(errorCode);
        });
    }

    transferGroup(groupId, newOwner, lines, notifyMessageContent, successCB, failCB) {
        let payload = notifyMessageContent.encode();
        proto.transferGroup(groupId, newOwner, lines, JSON.stringify(payload), () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    getFavGroups() {
        let result = proto.getFavGroups();
        return JSON.parse(result);
    }

    isFavGroup(groupId) {
        return proto.isFavGroup(groupId);
    }

    async setFavGroup(groupId, fav, successCB, failCB) {
        proto.setFavGroup(groupId, fav, () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    getUserSetting(scope, key) {
        return proto.getUserSetting(scope, key);
    }

    getUserSettings(scope) {
        let result = proto.getUserSettings(scope);
        return JSON.parse(result);
    }

    async setUserSetting(scope, key, value, successCB, failCB) {
        proto.setUserSetting(scope, key, value, () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            failCB(errorCode);
        });
    }

    modifyMyInfo() {
        // TODO
        self.users.delete(self.getUserId())
    }

    isGlobalSlient() {
        return proto.isGlobalSlient();
    }

    setGlobalSlient(silent, successCB, failCB) {
        proto.setGlobalSlient(silent, () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    isHiddenNotificationDetail() {
        return proto.isHiddenNotificationDetail();
    }

    async setHiddenNotificationDetail(hide, successCB, failCB) {
        proto.setHiddenNotificationDetail(hide, () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    isHiddenGroupMemberName(groupId) {
        return proto.isHiddenGroupMemberName(groupId);
    }

    async setHiddenGroupMemberName(groupId, hide, successCB, failCB) {
        proto.setHiddenGroupMemberName(groupId, hide, () => {
            successCB();
        }, (errorCode) => {
            failCB(errorCode);
        });
    }

    async joinChatroom(chatroomId, successCB, failCB) {
        proto.joinChatroom(chatroomId, () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    async quitChatroom(chatroomId, successCB, failCB) {
        proto.quitChatroom(chatroomId, () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    async getChatroomInfo(chatroomId, updateDt, successCB, failCB) {
        proto.getChatroomInfo(chatroomId, updateDt, (info) => {
            if (successCB) {
                successCB(JSON.parse(info));
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    async getChatroomMemberInfo(chatroomId, maxCount, successCB, failCB) {
        proto.getChatroomMemberInfo(chatroomId, maxCount, (info) => {
            if (successCB) {
                successCB(Object.assign(new ChatRoomMemberInfo(), JSON.parse(info)));
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    createChannel(name, portrait, status, desc, extra, successCB, failCB) {
        proto.createChannel(name, portrait, status, desc, extra, (info) => {
            if (successCB) {
                successCB(Object.assign(new ChannelInfo(), JSON.parse(info)));
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    getChannelInfo(channelId, refresh) {
        let result = proto.getChannelInfo(channelId, refresh);
        if (result === '') {
            return null;
        }

        return Object.assign(new ChannelInfo(), JSON.parse(result));
    }

    async modifyChannelInfo(channelId, type, newValue, successCB, failCB) {
        proto.modifyChannelInfo(channelId, type, newValue, () => {
            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    searchChannel(keyword, successCB, failCB) {
        proto.searchChannel(keyword, (result) => {
            if (successCB) {
                let channels = [];
                let tmp = JSON.parse(result);
                tmp.forEach(channel => {
                    channels.push(Object.assign(new ChannelInfo(), channel));
                });
                successCB(channels);
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    isListenedChannel(channelId) {
        return proto.isListenedChannel(channelId);
    }

    async listenChannel(channelId, listen, successCB, failCB) {
        proto.listenChannel(channelId, listen, () => {
            successCB();
        }, errorCode => {
            failCB(errorCode);
        });
    }

    // return channelIds
    getMyChannels() {
        let result = proto.getMyChannels();
        return JSON.parse(result);
    }

    getListenedChannels() {
        let result = proto.getListenedChannels();
        return JSON.parse(result);
    }

    async destoryChannel(channelId, successCB, failCB) {
        proto.destoryChannel(channelId, () => {
            if (successCB) {
                successCB();
            }
        }, errorCode => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    getConversationList(types, lines) {
        var conversationListStr = proto.getConversationInfos(types, lines);
        // console.log(conversationListStr);
        // TODO convert to conversationInfo, messageContent

        let conversationInfoList = [];
        let tmp = JSON.parse(conversationListStr);
        tmp.forEach(c => {
            conversationInfoList.push(ConversationInfo.protoConversationToConversationInfo(c));
        });

        return conversationInfoList;
    }

    getConversationInfo(conversation) {
        let convStr = proto.getConversationInfo(JSON.stringify(conversation));
        return ConversationInfo.protoConversationToConversationInfo(JSON.parse(convStr));
    }

    searchConversation(keyword, types = [], lines = []) {
        let result = proto.searchConversation(keyword, types, lines);
        let resultList = JSON.parse(result);
        var conversationSearchResult = [];
        if (resultList && resultList.length > 0) {
            resultList.forEach(r => {
                conversationSearchResult.push(ConversationSearchResult.fromProtoConversationSearchResult(r));
            });
        }
        return conversationSearchResult;
    }

    async removeConversation(conversation, clearMsg) {
        proto.removeConversation(JSON.stringify(conversation), clearMsg);
    }

    setConversationTop(conversation, top, successCB, failCB) {
        proto.setConversationTop(JSON.stringify(conversation), top, () => {
            let conversationInfo = self.getConversationInfo(conversation);
            self.eventEmitter.emit(EventType.ConversationInfoUpdate, conversationInfo);

            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    setConversationSlient(conversation, silent, successCB, failCB) {
        proto.setConversationSlient(JSON.stringify(conversation), top, () => {
            let conversationInfo = self.getConversationInfo(conversation);
            self.eventEmitter.emit(EventType.ConversationInfoUpdate, conversationInfo);

            if (successCB) {
                successCB();
            }
        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    setConversationDraft(conversation, draft = '') {
        proto.setConversationDraft(JSON.stringify(conversation), draft);
    }

    getUnreadCount(types = [], lines = [0]) {
        let unreadCountStr = proto.getUnreadCount(types, lines);
        return Object.assign(new UnreadCount(), JSON.parse(unreadCountStr));
    }

    getConversationUnreadCount(conversation) {
        let unreadCountStr = proto.getConversationUnreadCount(JSON.stringify(conversation));
        return Object.assign(new UnreadCount(), JSON.parse(unreadCountStr));
    }

    clearConversationUnreadStatus(conversation) {
        proto.clearUnreadStatus(JSON.stringify(conversation));
        let conversationInfo = self.getConversationInfo(conversation);
        self.eventEmitter.emit(EventType.ConversationInfoUpdate, conversationInfo);
    }

    clearAllUnreadStatus() {
        // TODO emit ConversationInfoUpdate event
        proto.clearAllUnreadStatus();
    }

    setMediaMessagePlayed(messageId) {
        // TODO need to emit message update event?
        proto.setMediaMessagePlayed(messageId);
    }

    isMyFriend(userId) {
        return proto.isMyFriend(userId);
    }

    async sendFriendRequest(userId, reason, successCB, failCB) {
        proto.sendFriendRequest(userId, reason, () => {
            if (successCB) {
                successCB();
            }

        }, (errorCode) => {
            if (failCB) {
                failCB(errorCode);
            }
        });
    }

    /**
     * 
     * @param {Conversation} conversation
     * @param {number} fromIndex 
     * @param {boolean} before 
     * @param {number} count 
     * @param {string} withUser 
     */
    async getMessages(conversation, fromIndex, before = true, count = 20, withUser = '') {
        let protoMsgsStr = proto.getMessages(JSON.stringify(conversation), [], fromIndex, before, count, withUser);
        // let protoMsgsStr = proto.getMessages('xxx', [0], fromIndex, before, count, withUser);
        var protoMsgs = JSON.parse(protoMsgsStr);
        let msgs = [];
        protoMsgs.map(m => {
            let msg = Message.fromProtoMessage(m);
            if (msg) {
                msgs.push(msg);
            }
        });
        console.log('getMessages', msgs.length);

        return msgs;
    }

    getMessageById(messageId) {
        let mStr = proto.getMessage(messageId);
        return Message.fromProtoMessage(JSON.parse(mStr));
    }

    getMessageByUid(messageUid) {
        let mStr = proto.getMessageByUid(messageUid);
        return Message.fromProtoMessage(JSON.parse(mStr));
    }

    searchMessage(conversation, keyword) {
        let result = proto.searchMessage(JSON.stringify(conversation), keyword);
        let msgs = JSON.parse(result);
        let matchMsgs = [];
        if (msgs && msgs.length > 0) {
            msgs.forEach(m => {
                matchMsgs.push(Message.fromProtoMessage(m));
            });
        }

        return matchMsgs;
    }

    async sendConversationMessage(conversation, messageContent, toUsers, preparedCB, progressCB, successCB, failCB) {
        let message = new Message();
        message.conversation = conversation;
        message.messageContent = messageContent;
        self.sendMessageEx(message, toUsers, preparedCB, progressCB, successCB, failCB);
    }

    async sendMessage(message, preparedCB, progressCB, successCB, failCB) {
        self.sendMessageEx(message, [], preparedCB, progressCB, successCB, failCB);
    }

    // toUsers 用来实现定向消息
    async sendMessageEx(message, toUsers = [], preparedCB, progressCB, successCB, failCB) {
        let strConv = JSON.stringify(message.conversation);
        message.content = await message.messageContent.encode();
        console.log('--------------p', message.content);
        let strCont = JSON.stringify(message.content);

        proto.sendMessage(strConv, strCont, toUsers, 0,
            function (messageId, timestamp) { //preparedCB
                message.memberId = messageId;
                if (typeof preparedCB === 'function') {
                    preparedCB(messageId, Number(timestamp));
                }
            },
            function (uploaded, total) { //progressCB
                if (typeof progressCB === 'function') {
                    progressCB(uploaded, total);
                }
                // upload progress update
                //self.eventEmitter.emit(EventType.MessageStatusUpdate, message);
            },
            function (messageUid, timestamp) { //successCB
                message.messageUid = messageUid;
                if (typeof successCB === 'function') {
                    successCB(Number(messageUid), Number(timestamp));
                }
                self.eventEmitter.emit(EventType.MessageStatusUpdate, message);
            },
            function (errorCode) { //errorCB
                if (typeof failCB === 'function') {
                    failCB(errorCode);
                }
                self.eventEmitter.emit(EventType.MessageStatusUpdate, message);
            });

        self.eventEmitter.emit(EventType.SendMessage, message);
    }

    // 更新了原始消息的内容
    async recallMessage(messageUid, successCB, failCB) {
        console.log('recall', messageUid);
        proto.recall(messageUid,
            () => {
                console.log('recall, s', messageUid);
                if (successCB) {
                    successCB();
                    this.onRecallMessage(this.getUserId(), messageUid);
                }
            },
            (errorCode) => {
                console.log('recall, f', messageUid, errorCode);
                if (failCB) {
                    failCB();
                }
            });
    }

    deleteMessage(messageId) {
        let result = proto.deleteMessage(messageId);
        if (result) {
            this.onMessageDeleted(messageId);
        }
        return result;
    }

    async clearMessages(conversation) {
        proto.clearMessages(JSON.stringify(conversation));
        let conversationInfo = this.getConversationInfo(conversation);
        self.eventEmitter.emit(EventType.ConversationInfoUpdate, conversationInfo);
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
        proto.insertMessage(JSON.stringify(conversation), self.userId, JSON.stringify(messageContent), status, notify, serverTime);
    }

    async updateMessageContent(messageId, messageContent) {
        proto.updateMessage(messageId, JSON.stringify(messageContent))
    }

    async uploadMedia(data, mediaType, successCB, failCB, progressCB) {
        // var data = file.slile(0, file.size);
        proto.uploadMedia(data, mediaType,
            (remoteUrl) => {
                if (successCB) {
                    successCB(remoteUrl);
                }
            },
            (errorCode) => {
                if (failCB) {
                    failCB(errorCode);
                }
            },
            (current, total) => {
                if (progressCB) {
                    progressCB(current, total);
                }
            });
    }

    test() {

        // let u = proto.getUserInfo('uiuJuJcc', true)
        // let u1 = Object.assign(new UserInfo(), JSON.parse(u));
        // u1.hello();

        console.log('---------------test start----------------------');
        let u = self.getUserInfo('uiuJuJccj', true);
        u.hello();
        console.log('user info', u);
        self.getMessageById(200);

        let g = self.getGroupInfo('PHPSPS22');
        console.log(g);

        let m = self.getGroupMembers('PHPSPS22');
        console.log(m);

        this.getMyGroupList();

        console.log('localStorage', localStorage.getItem('test'));
        localStorage.setItem('test', 'hello world');
        console.log('localStorage', localStorage.getItem('test'));

        console.log('atob', btoa('hello world'));
        self.uploadMedia('hello world', MessageContentMediaType.Image,
            (remoteUrl) => {
                console.log('----------------upload success', remoteUrl);
            },
            (errorCode) => {
                console.log('-------------upload error', errorCode);
            },
            (current, total) => {

            });

        // let conversation = new Conversation(ConversationType.Group, "tTt5t566", 0);
        // let content = new TextMessageContent("hello");
        // self.sendConversationMessage(conversation, content, ["CbGHCH88"])
        // content = new TextMessageContent("world");
        // self.sendConversationMessage(conversation, content, [])

        console.log('---------------test end----------------------');
    }
}
const self = new WfcManager();
export default self;