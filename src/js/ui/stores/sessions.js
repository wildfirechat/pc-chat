
/* eslint-disable no-eval */
import axios from 'axios';
import { observable, action } from 'mobx';
import { ipcRenderer } from '../../platform';

import helper from 'utils/helper';
import storage from 'utils/storage';
import wfc from '../../wfc/client/wfc';
import ConversationType from '../../wfc/model/conversationType';

async function updateMenus({ conversations = [], contacts = [] }) {
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
    @observable auth;
    @observable conversations = [];

    syncKey;

    genSyncKey(list) {
        return (self.syncKey = list.map(e => `${e.Key}_${e.Val}`).join('|'));
    }

    @action genConversationKey(index) {
        let conversation = self.conversations[index]
        return conversation.type + conversation.target + conversation.line;
    }

    async test(info) {
        console.log('test', info);
    }

    @action async reloadConversation(conversation) {
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

    @action async loadConversations() {
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


    @action removeConversation(conversation) {

        self.conversations = self.conversations.filter(e => !e.conversation.equal(conversation.conversation));

        wfc.removeConversation(conversation, true);

        updateMenus({
            conversations: self.conversations.slice(0, 10)
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
