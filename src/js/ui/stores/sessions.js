/* eslint-disable no-eval */
import { observable, action } from 'mobx';

import wfc from '../../wfc/client/wfc';
import ConversationType from '../../wfc/model/conversationType';
import pinyin from "../han/lib";
import stores from "./index";
import ConversationInfo from "../../wfc/model/conversationInfo";

class sessions {
    @observable conversations = [];
    @observable filtered = {
        query: '',
        result: [],
    };
    @observable unreadMessageCount = 0;

    @action genConversationKey(index) {
        let conversation = self.conversations[index]
        return conversation.type + conversation.target + conversation.line;
    }

    @action setUnreadMessageCount(count){
        self.unreadMessageCount = count;
    }

    @action
    async reloadConversation(conversation) {
        let info = wfc.getConversationInfo(conversation);
        let i = -1;
        for (let index = 0; index < self.conversations.length; index++) {
            if (self.conversations[index].conversation.equal(conversation)) {
                i = index;
            }
        }
        if (i >= 0) {
            self.conversations[i] = info;
        } else {
            self.conversations.push(info);
        }
        console.log('refresh conversation', conversation);
    }

    @action
    loadConversations() {
        let cl = wfc.getConversationList([ConversationType.Single, ConversationType.Group, ConversationType.Channel], [0]);
        if(cl.length !== self.conversations.length){
            self.conversations = cl;
        }else {
            for (let i = 0; i < cl.length; i++) {
                if(!ConversationInfo.equals(cl[i], self.conversations[i])) {
                    self.conversations = cl;
                    break
                }
            }
        }
    }

    @action removeConversation(conversationInfo) {
        self.conversations = self.conversations.filter(e => !e.conversation.equal(conversationInfo.conversation));
        wfc.removeConversation(conversationInfo.conversation, true);
        stores.chat.removeConversation(conversationInfo.conversation);
    }

    @action clearConversationUnreadStatus(conversationInfo) {
        wfc.clearConversationUnreadStatus(conversationInfo.conversation);
        self.conversations.forEach(ci => {
            if (ci.conversation.equal(conversationInfo.conversation)) {
                ci.unreadCount.unread = 0;
                ci.unreadMention = 0;
                ci.unreadMentionAll = 0;
            }
        });
    }


    @action
    async sticky(conversationInfo) {
        wfc.setConversationTop(conversationInfo.conversation, !conversationInfo.isTop, () => {

        }, (errorCode) => {
            // do nothing
        });
    }

    @action
    async slient(conversationInfo, callback) {
        wfc.setConversationSlient(conversationInfo.conversation, conversationInfo.isSilent, () => {
            callback();
        }, (errorCode) => {
            // do nothing
        });
    }


    @action filter(text = '') {
        if (!text) {
            self.filtered = {
                query: '',
                result: []
            };
            return;
        }
        let pinyinText = pinyin.letter(text.toLocaleLowerCase(), '', null);
        var list = self.conversations.filter(c => {
            let name = c.title();
            var res = pinyin.letter(name, '', null).toLowerCase().indexOf(pinyinText) > -1;

            return res;
        });
        self.filtered = {
            query: text,
            result: list.length ? list : []
        };
    }
}

const self = new sessions();
export default self;
