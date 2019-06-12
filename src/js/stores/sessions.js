
/* eslint-disable no-eval */
import axios from 'axios';
import { observable, action } from 'mobx';
import { ipcRenderer } from 'electron';

import helper from 'utils/helper';
import storage from 'utils/storage';
import wfc from '../wfc/wfc';
import ConversationType from '../wfc/model/conversationType';

async function updateMenus({ conversations = [], contacts = [] }) {
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
        cookies: await helper.getCookie(),
    });
}
class sessions {
    @observable auth;
    @observable conversations = [];

    syncKey;

    genSyncKey(list) {
        return (self.syncKey = list.map(e => `${e.Key}_${e.Val}`).join('|'));
    }

    @action genConversationKey(index) {
        let conversation = self.conversations[index]
        return conversation.conversationType + conversation.target + conversation.line;
    }

    async test(info) {
        console.log('test', info);
    }

    @action async loadConversations() {
        let cl = wfc.getConversationList([ConversationType.Single, ConversationType.Group, ConversationType.Channel], [0, 1]);
        self.conversations = cl;
        let counter = 0;
        cl.map((e, index) => {
            counter += e.unreadCount.unread;
        });
        console.log('loadConversations', counter);
        ipcRenderer.send(
            'message-unread',
            {
                counter,
            }
        );
    }


    @action removeConversation(conversation) {

        let conversations = self.conversations.filter(e => !e.conversation.equal(conversation));
        self.conversations.replace(conversations);

        wfc.removeConversation(conversation, true);

        updateMenus({
            conversations: conversations.slice(0, 10)
        });
    }

    @action async sticky(conversationInfo) {
        wfc.setConversationTop(conversationInfo.conversation, !conversationInfo.isTop, () => {
            updateMenus({
                conversations: self.conversations.slice(0, 10)
            });
        }, (errorCode) => {
            // do nothing
        });
    }

    @action async logout() {
        var auth = self.auth;

        try {
            await axios.post(`/cgi-bin/mmwebwx-bin/webwxlogout?skey=${auth.skey}&redirect=0&type=1`, {
                sid: auth.sid,
                uin: auth.uid,
            });
        } finally {
            self.exit();
        }
    }

    async exit() {
        await storage.remove('auth');
        window.location.reload();
    }
}

const self = new sessions();
export default self;
