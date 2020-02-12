/* eslint-disable no-eval */
import axios from 'axios';
import {observable, action} from 'mobx';
import {ipcRenderer} from '../../platform';

import wfc from '../../wfc/client/wfc';
import ConversationType from '../../wfc/model/conversationType';
import pinyin from "../han/lib";

async function updateMenus({conversations = [], contacts = []}) {
    if (!ipcRenderer) {
        return;
    }
    ipcRenderer.send('menu-update', {
        conversations: conversations.map(e => ({
            id: e.UserName,
            name: e.RemarkName || e.NickName,
            avatar: e.HeadImgUrl,
        })),
        contacts: contacts.map(e => ({
            id: e.UserName,
            name: e.RemarkName || e.NickName,
            avatar: e.HeadImgUrl,
        })),
    });
}

class sessions {
    @observable conversations = [];
    @observable filtered = {
        query: '',
        result: [],
    };

    @action genConversationKey(index) {
        let conversation = self.conversations[index]
        return conversation.type + conversation.target + conversation.line;
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
    async loadConversations() {
        let cl = wfc.getConversationList([ConversationType.Single, ConversationType.Group, ConversationType.Channel], [0]);
        self.conversations = cl;
        let counter = 0;
        cl.forEach((e) => {
            counter += e.unreadCount.unread;
        });
        console.log('loadConversations', counter);
        if (ipcRenderer) {
            ipcRenderer.send(
                'message-unread',
                {
                    counter,
                }
            );
        } else {
            document.title = counter === 0 ? "野火IM" : (`野火IM(有${counter}条未读消息)`);
        }
    }


    @action removeConversation(conversationInfo) {

        self.conversations = self.conversations.filter(e => !e.conversation.equal(conversationInfo.conversation));

        wfc.removeConversation(conversationInfo.conversation, true);

        updateMenus({
            conversations: self.conversations.slice(0, 10)
        });
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
            updateMenus({
                conversations: self.conversations.slice(0, 10)
            });
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
        text = pinyin.letter(text.toLocaleLowerCase(), '', null);
        var list = self.conversations.filter(c => {
            let name = c.title();
            var res = pinyin.letter(name, '', null).toLowerCase().indexOf(text) > -1;

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
