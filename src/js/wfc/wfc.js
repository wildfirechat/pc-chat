import proto from 'node-loader!../../../node_modules/marswrapper.node';
import * as wfcMessage from '../wfc/messageConfig'
import Message from '../wfc/messages/message';
import Conversation from '../wfc/model/conversation';
import ConversationInfo from '../wfc/model/conversationInfo';
import { EventEmitter } from 'events';
import { EventTypeReceiveMessage, EventTypeSendMessage, EventTypeMessageStatusUpdate, EventTypeUserInfoUpdate, EventTypeConnectionStatusChanged } from '../wfc/wfcEvents'
import UserInfo from '../wfc/model/userInfo';
import NullUserInfo from '../wfc/model/nullUserInfo';
import NullGroupInfo from './model/nullGroupInfo';
import GroupInfo from './model/groupInfo';
import { UserSettingScope_FavoriteGroup } from './userSettingScopes';
import GroupMember from './model/groupMember';

// 其实就是imclient，后续可能需要改下名字
class WfcManager {
    connectionStatus = 0;
    userId = '';
    token = '';

    onReceiveMessageListeners = [];

    messageContentList = new Map();

    eventEmitter = new EventEmitter();

    onConnectionChanged(status) {
        self.connectionStatus = status;
        self.eventEmitter.emit(EventTypeConnectionStatusChanged, status);
        console.log('connection status changed', status);
    }

    onReceiveMessage(messages, hasMore) {
        var msgs = JSON.parse(messages);
        msgs.map(m => {
            let msg = Message.protoMessageToMessage(m);
            console.log(msg.messagecontent);
            self.onReceiveMessageListeners.forEach(listener => {
                listener(msg, hasMore);
            });

            self.eventEmitter.emit(EventTypeReceiveMessage, msg);
        });
    }

    onUserInfoUpdate(userIds) {
        console.log('userIndo update, ids', userIds);
        userIds.map((userId => {
            self.eventEmitter.emit(EventTypeUserInfoUpdate, userId);
        }))
    }

    onFriendListUpdate(friendListIds) {
        console.log('friendList update, ids', friendListIds);
    }

    init() {
        proto.setConnectionStatusListener(self.onConnectionChanged);
        proto.setReceiveMessageListener(self.onReceiveMessage);
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

    setServerAddress(host, port) {
        proto.setServerAddress(host, port);
    }

    async connect(userId, token) {
        self.setServerAddress("wildfirechat.cn", 80);
        proto.connect(userId, token);

        // for testing your code
        self.test();
    }

    registerDefaultMessageContents() {
        wfcMessage.MessageContents.map((e) => {
            proto.registerMessageFlag(e.type, e.flag);
            self.registerMessageContent(e.type, e.content);
        });
    }

    getUserId() {
        // TODO login的时候确定
        return 'UZUWUWuu';
    }

    getMyGroupList() {
        let str = proto.getUserSettings(UserSettingScope_FavoriteGroup);
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

    getGroupInfo(groupId, fresh = false) {
        let groupInfoStr = proto.getGroupInfo(groupId, fresh);
        if (groupInfoStr === '') {
            return new NullGroupInfo(target);
        } else {
            return Object.assign(new GroupInfo(), JSON.parse(groupInfoStr));
        }
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

    /**
     * 
     * @param {function} listener 
     */
    setOnReceiveMessageListener(listener) {
        if (typeof listener !== 'function') {
            console.log('listener should be a function');
            return;
        }
        self.onReceiveMessageListeners.forEach(l => {
            l === listener
            return
        });
        self.onReceiveMessageListeners.push(listener);
    }

    removeOnReceiMessageListener(listener) {
        if (typeof listener !== 'function') {
            console.log('listener should be a function');
            return;
        }
        self.onReceiveMessageListeners.splice(self.onReceiveMessageListeners.indexOf(listener), 1);
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
            msgs.push(msg);
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

    async sendMessage(message, preparedCB, uploadedCB, successCB, failCB) {
        let strConv = JSON.stringify(message.conversation);
        message.content = message.messageContent.encode();
        let strCont = JSON.stringify(message.content);

        proto.sendMessage(strConv, strCont, "", 0, function (messageId, timestamp) { //preparedCB
            if (typeof preparedCB === 'function') {
                preparedCB(messageId, Number(timestamp));
            }
        }, function (uploaded, total) { //progressCB
            if (typeof uploadedCB === 'function') {
                uploadedCB(uploaded, total);
            }
        }, function (messageUid, timestamp) { //successCB
            if (typeof successCB === 'function') {
                successCB(Number(messageUid), timestamp);
            }
        }, function (errorCode) { //errorCB
            if (typeof failCB === 'function') {
                failCB(errorCode);
            }
        });

        self.eventEmitter.emit(EventTypeSendMessage, message);
    }

    test() {

        // let u = proto.getUserInfo('uiuJuJcc', true)
        // let u1 = Object.assign(new UserInfo(), JSON.parse(u));
        // u1.hello();

        let u = self.getUserInfo('uiuJuJccj', true);
        u.hello();
        console.log('user info', u);
        self.getMessageById(200);

        let g = self.getGroupInfo('PHPSPS22');
        console.log(g);

        let m = self.getGroupMembers('PHPSPS22');
        console.log(m);

        self.getMyGroupList();
    }
}
const self = new WfcManager();
export default self;