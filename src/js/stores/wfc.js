import { observable, action} from 'mobx';
import proto from 'node-loader!../../../node_modules/marswrapper.node';
import TextMessageContent from '../wfc/messages/textMessageContent'
import * as wfcMessage from '../wfc/messageConfig'
import Message from '../wfc/messages/message';
import Conversation from '../wfc/conversation';
import ConversationInfo from '../wfc/conversationInfo';
import MessageContent from '../wfc/messages/baseContent';


class WfcManager {
    @observable connectionStatus = 0;
    @observable userId = '';
    @observable token = '';

    onReceiveMessageListeners = [];

    messageContentList = new Map();

    @action onConnectionChanged(status){
        self.connectionStatus = status;
        console.log('status', status);
    }
    onReceiveMessage(messages, hasMore){
        var msgs = JSON.parse(messages);
        msgs.map(m => {
            let msg = Message.protoMessageToMessage(m);
            console.log(msg.messagecontent);
            self.onReceiveMessageListeners.forEach(listener => {
                listener(msg, hasMore);
            });
        });
    }

    async init(){
        proto.setConnectionStatusListener(self.onConnectionChanged);
        proto.setReceiveMessageListener(self.onReceiveMessage);
        self.registerDefaultMessageContents();


        // var json = '{"base":"jjjjjjjjj", "name":"indx", "content":"hello world content"}'
        // // let test = Object.assign(new self.abc(), JSON.parse(json));
        // console.log('test import');
        // var xxx = TextMessageContent;
        // var test = new xxx();

        // test.decode(json);

        // console.log(test.content);
        // console.log(test.base);

        // var json = '    { "conversation":{ "conversationType": 0, "target": "UZUWUWuu", "line": 0 }, "from": "UZUWUWuu", "content": { "type": 1, "searchableContent": "1234", "pushContent": "", "content": "", "binaryContent": "", "localContent": "", "mediaType": 0, "remoteMediaUrl": "", "localMediaPath": "", "mentionedType": 0, "mentionedTargets": [ ] }, "messageId": 52, "direction": 1, "status": 5, "messageUid": 75735276990792720, "timestamp": 1550849394256, "to": "" } ';
        // let msg = Object.assign(new Message(), JSON.parse(json));
        // let contentClazz = wfcMessage.getMessageContentClazz(msg.content.type);
        // let text = new contentClazz();
        // text.decode(msg.content);
        // console.log(text.content);
        // console.log(text instanceof TextMessageContent);
        // console.log(msg.from);
        // console.log(msg.content);

        // let c1 = new Conversation();
        // c1.target = 'target';
        // c1.conversationType = 0;
        // c1.line = 0;

        // let c2 = new Conversation();
        // c2.target = 'target';
        // c2.conversationType = 0;
        // c2.line = 0;

        // console.log('conversation is same: ', _.isEqual(c1, c2));

        let a = new MessageContent(2, 2);
        console.log(a.mentionedType);
        // a = new MessageContent(null, 1);
        // console.log(a.mentionedType);
        // a = new MessageContent(null, 1, []);
        // console.log(a.mentionedType);
    }

    /**
     * 
     * @param {messagecontent} content 
     */
    registerMessageContent(type, content){
        self.messageContentList[type] = content; 
    }

    async setServerAddress(host, port){
        proto.setServerAddress("wildfirechat.cn", 80);
    }

    async connect(userId, token){
        proto.setServerAddress("wildfirechat.cn", 80);
        proto.connect(userId, token);
    }

    registerDefaultMessageContents(){
        wfcMessage.MessageContents.map((e)=>{
            proto.registerMessageFlag(e.type, e.flag);
            self.registerMessageContent(e.type, e.content);
        });
    }

    /**
     * 
     * @param {function} listener 
     */
    setOnReceiveMessageListener(listener){
        if (typeof listener !== 'function'){
            console.log('listener should be a function');
            return;
        }
        self.onReceiveMessageListeners.forEach(l => {
            l === listener
            return
        });
        self.onReceiveMessageListeners.push(listener);
    }

    removeOnReceiMessageListener(listener){
        if (typeof listener !== 'function'){
            console.log('listener should be a function');
            return;
        }
        self.onReceiveMessageListeners.splice(self.onReceiveMessageListeners.indexOf(listener), 1);
    }

    @action async getConversationList(types, lines){
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

    @action async getConversationInfo(conversation){

    }

    /**
     * 
     * @param {Conversation} conversation
     * @param {number} fromIndex 
     * @param {boolean} before 
     * @param {number} count 
     * @param {string} withUser 
     */
    @action async getMessages(conversation, fromIndex, before = true, count = 20, withUser = ''){
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

    @action async getMessageById(messageId){

    }
    
    @action async getMessageByUid(messageUid){

    }

    @action async getUserInfo(userId){

    }


    async sendMessage(message, preparedCB, uploadedCB, successCB, failCB){
        let strConv = JSON.stringify(message.conversation);
        message.content = message.messageContent.encode();
        let strCont = JSON.stringify(message.content);
        proto.sendMessage(strConv, strCont, "", 0, function(messageId, timestamp) { //preparedCB
            if(typeof preparedCB === 'function'){
                preparedCB(messageId, Number(timestamp));
            }
        }, function(uploaded, total) { //progressCB
            if(typeof uploadedCB === 'function'){
                uploadedCB(uploaded, total);
            }
        }, function(messageUid, timestamp) { //successCB
            if(typeof successCB === 'function'){
                successCB(Number(messageUid), timestamp);
            }
        }, function(errorCode) { //errorCB
            if(typeof failCB === 'function'){
                failCB(errorCode);
            }
        });
    }
}
const self = new WfcManager();
export default self;