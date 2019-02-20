import { observable, action } from 'mobx';
import proto from 'node-loader!../../../../node_modules/marswrapper.node';

class WfcManager {
    @observable connectionStatus = false;
    @observable conversationList = [];
    @observable userId = '';
    @observable token = '';


    @action async toggle(show = self.show, user = self.user, remove = false) {
    }

    @action async getConversationList(types, lines){
        return proto.getConversationList(types, lines);
    }

    @action getConversation(type, target, line = 0){

    }

    onReceiveMessage(messages, hasMore){
        if(messages.lenght > 0){
            messages.map(m => {

            });
        }
    }

    onConnectionStatusChange(status){

    }

    // TODO
    sendMessage(){

    }

}