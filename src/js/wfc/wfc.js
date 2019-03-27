import proto from 'node-loader!../../../node_modules/marswrapper.node';
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

// 其实就是imclient，后续可能需要改下名字
class WfcManager {
    connectionStatus = 0;
    userId = '';
    token = '';

    // TODO 移除吧，全都走EventEmitter
    // onReceiveMessageListeners = [];

    messageContentList = new Map();

    eventEmitter = new EventEmitter();

    onConnectionChanged(status) {
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
        var msgs = JSON.parse(messages);
        msgs.map(m => {
            let msg = Message.protoMessageToMessage(m);
            // self.onReceiveMessageListeners.forEach(listener => {
            //     listener(msg, hasMore);
            // });
            if (msg) {
                self.eventEmitter.emit(EventType.ReceiveMessage, msg);
            }
        });
    }

    onRecallMessage(operatorUid, messageUid) {
        self.eventEmitter.emit(EventType.ReceiveMessage, operatorUid, messageUid);
    }

    onMessageDeleted(messageId) {
        self.eventEmitter.emit(EventType.DeleteMessage, messageId);
    }

    onUserInfoUpdate(userIds) {
        console.log('userIndo update, ids', userIds);
        let userIdA = JSON.parse(userIds);
        userIdA.map((userId => {
            self.eventEmitter.emit(EventType.UserInfoUpdate, userId);
        }))
    }

    onFriendListUpdate(friendListIds) {
        console.log('friendList update, ids', friendListIds);
    }

    init() {
        proto.setConnectionStatusListener(self.onConnectionChanged);
        proto.setReceiveMessageListener(self.onReceiveMessage, self.onRecallMessage);
        proto.setUserInfoUpdateListener(self.onUserInfoUpdate);
        proto.setFriendUpdateListener(self.onFriendListUpdate);
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
        this.userId = userId;
        proto.connect(userId, token);

        // for testing your code
        self.test();
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
        return this.userId;
    }

    getServerDeltaTime() {
        return proto.getServerDeltaTime();
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
        let userInfoStr = proto.getUserInfo(userId, fresh);
        if (userInfoStr === '') {
            return new NullUserInfo(userId);
        } else {
            return Object.assign(new UserInfo(), JSON.parse(userInfoStr));
        }
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
        console.log('-------------a ', notifyContentStr);
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
        let groupInfoStr = proto.getGroupInfo(groupId, fresh);
        if (groupInfoStr === '') {
            return new NullGroupInfo(groupId);
        } else {
            return Object.assign(new GroupInfo(), JSON.parse(groupInfoStr));
        }
    }

    addGroupMembers(groupId, memberIds, notifyLines, notifyMessageContent, successCB, failCB) {
        if (!notifyMessageContent) {
            notifyMessageContent = new AddGroupMemberNotification(this.getUserId(), memberIds);
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
        let groupMembers = this.getGroupMembers(groupId, fresh);
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

    removeGroupMembers(groupId, memberIds, notifyLines, notifyMsg, successCB, failCB) {
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

    clearConversationUnreadStatus(conversation) {
        proto.clearUnreadStatus(JSON.stringify(conversation));
        let conversationInfo = self.getConversationInfo(conversation);
        self.eventEmitter.emit(EventType.ConversationInfoUpdate, conversationInfo);
    }

    isMyFriend(userId) {
        return proto.isMyFriend(userId);
    }

    sendFriendRequest(userId, reason, successCB, failCB) {
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
            let msg = Message.protoMessageToMessage(m);
            if (msg) {
                msgs.push(msg);
            }
        });
        console.log('getMessages', msgs.length);

        return msgs;
    }

    getMessageById(messageId) {
        let mStr = proto.getMessage(messageId);
        return Message.protoMessageToMessage(JSON.parse(mStr));
    }

    getMessageByUid(messageUid) {
        let mStr = proto.getMessageByUid(messageUid);
        return Message.protoMessageToMessage(JSON.parse(mStr));
    }

    // to 用来实现定向消息
    async sendMessage(message, to, preparedCB, progressCB, successCB, failCB) {
        let strConv = JSON.stringify(message.conversation);
        message.content = await message.messageContent.encode();
        let strCont = JSON.stringify(message.content);

        proto.sendMessage(strConv, strCont, to, 0,
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
        console.log('---------------test end----------------------');
    }
}
const self = new WfcManager();
export default self;