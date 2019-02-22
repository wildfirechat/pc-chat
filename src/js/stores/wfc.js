import { observable, action} from 'mobx';
import proto from 'node-loader!../../../node_modules/marswrapper.node';

const TextMessageContentType = 1;
const PersitFlag_No_Persist = 0;
const PersitFlag_Persist= 1;
const PersitFlag_Persist_And_Count= 3;
const PersitFlag_Transparent= 4;

const MessageTypeAndFlag = [
    {
    name:'text',
    flag:PersitFlag_Persist_And_Count,
    type:1
    },
    {
    name:'voice',
    flag:PersitFlag_Persist_And_Count,
    type:2
    },
    {
    name:'image',
    flag:PersitFlag_Persist_And_Count,
    type:3
    },
    {
    name:'location',
    flag:PersitFlag_Persist_And_Count,
    type:4
    },
    {
    name:'file',
    flag:PersitFlag_Persist_And_Count,
    type:5
    },
    {
    name:'video',
    flag:PersitFlag_Persist_And_Count,
    type:6
    },
    {
    name:'sticker',
    flag:PersitFlag_Persist_And_Count,
    type:7
    },
    {
    name:'imageText',
    flag:PersitFlag_Persist_And_Count,
    type:8
    },
];

class WfcManager {
    @observable connectionStatus = 0;
    @observable userId = '';
    @observable token = '';

    onReceiveMessageListeners = [];

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
        self.registerMessageFlag();
    }

    async setServerAddress(host, port){
        proto.setServerAddress("wildfirechat.cn", 80);
    }

    async connect(userId, token){
        proto.connect(userId, token);
    }

    registerMessageFlag(){
        MessageTypeAndFlag.map((e)=>{
            proto.registerMessageFlag(e.type, e.flag);
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
        return JSON.parse(conversationListStr)
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