import { observable, action} from 'mobx';
import proto from 'node-loader!../../../node_modules/marswrapper.node';
import TextMessageContent from '../wfc/messages/text'
import * as wfcMessage from '../wfc/message'


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
        console.log('on ReceiveMessage');
        console.log(messages, hasMore);
        msgs.map(m => {
            self.onReceiveMessageListeners.forEach(listener => {
                console.log(m);
                listener(m, hasMore);
            });
        });
    }

    async init(){
        proto.setConnectionStatusListener(self.onConnectionChanged);
        proto.setReceiveMessageListener(self.onReceiveMessage);
        self.registerDefaultMessageContents();


        var json = '{"base":"jjjjjjjjj", "name":"indx", "content":"hello world content"}'
        // let test = Object.assign(new self.abc(), JSON.parse(json));
        console.log('test import');
        var xxx = TextMessageContent;
        var test = new xxx();

        test.decode(json);

        console.log(test.content);
        console.log(test.base);
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
        console.log(conversationListStr);
        return JSON.parse(conversationListStr);
    }

    @action async getConversation(type, target, line = 0){

    }

    /**
     * 
     * @param {string} type 
     * @param {string} target 
     * @param {number} line 
     * @param {number} fromIndex 
     * @param {boolean} before 
     * @param {number} count 
     * @param {string} withUser 
     */
    @action async getMessageList(type, target, line, fromIndex, before, count, withUser){
        return [];
    }

    @action async getMessageById(messageId){

    }
    
    @action async getMessageByUid(messageUid){

    }

    @action async getUserInfo(userId){

    }

    async sendTextMessage(type, target, line, to, text){

    }
}
const self = new WfcManager();
export default self;