import { observable, action} from 'mobx';
import proto from 'node-loader!../../../node_modules/marswrapper.node';

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
    }

    async setServerAddress(host, port){
        proto.setServerAddress("wildfirechat.cn", 80);
    }

    async connect(userId, token){
        proto.connect(userId, token);
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