
/* eslint-disable no-eval */
import axios from 'axios';
import { observable, action } from 'mobx';
import { ipcRenderer } from 'electron';

import helper from 'utils/helper';
import storage from 'utils/storage';
import { normalize } from 'utils/emoji';
import chat from './chat';
import contacts from './contacts';
import wfc from '../wfc/wfc';
import ConversationType from '../wfc/model/conversationType';

const CancelToken = axios.CancelToken;

//  function loadMars() {
//       // try {
//         return require('../../../node_modules/marswrapper.node');
//       // } catch (err) {
//       //   return require('../addons/build/Debug/marswrapper.node');
//       // }
//     }

//  const proto = loadMars();



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
    @observable loading = true;
    @observable auth;
    @observable code;
    @observable avatar;
    @observable user;
    @observable connected;
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
    @action async initUser() {
        var response = await axios.post(`/cgi-bin/mmwebwx-bin/webwxinit?r=${-new Date()}&pass_ticket=${self.auth.passTicket}`, {
            BaseRequest: {
                Sid: self.auth.wxsid,
                Uin: self.auth.wxuin,
                Skey: self.auth.skey,
            }
        });

        await axios.post(`/cgi-bin/mmwebwx-bin/webwxstatusnotify?lang=en_US&pass_ticket=${self.auth.passTicket}`, {
            BaseRequest: {
                Sid: self.auth.wxsid,
                Uin: self.auth.wxuin,
                Skey: self.auth.skey,
            },
            ClientMsgId: +new Date(),
            Code: 3,
            FromUserName: response.data.User.UserName,
            ToUserName: response.data.User.UserName,
        });

        self.user = response.data;
        self.user.ContactList.map(e => {
            e.HeadImgUrl = `${axios.defaults.baseURL}${e.HeadImgUrl.substr(1)}`;
        });
        // await contacts.getContats();
        await chat.loadChats(self.user.ChatSet);

        return self.user;
    }

    async getNewMessage() {
        var auth = self.auth;
        var response = await axios.post(`/cgi-bin/mmwebwx-bin/webwxsync?sid=${auth.wxsid}&skey=${auth.skey}&lang=en_US&pass_ticket=${auth.passTicket}`, {
            BaseRequest: {
                Sid: auth.wxsid,
                Uin: auth.wxuin,
                Skey: auth.skey,
            },
            SyncKey: self.user.SyncKey,
            rr: ~new Date(),
        });
        var mods = [];

        // Refresh the sync keys
        self.user.SyncKey = response.data.SyncCheckKey;
        self.genSyncKey(response.data.SyncCheckKey.List);

        // Get the new friend, or chat room has change
        response.data.ModContactList.map(e => {
            var hasUser = contacts.memberList.find(user => user.UserName === e.UserName);

            if (hasUser) {
                // Just update the user
                contacts.updateUser(e);
            } else {
                // If user not exists put it in batch list
                mods.push(e.UserName);
            }
        });

        // Delete user
        response.data.DelContactList.map((e) => {
            contacts.deleteUser(e.UserName);
            chat.removeChat(e);
        });

        if (mods.length) {
            await contacts.batch(mods, true);
        }

        response.data.AddMsgList.map(e => {
            var from = e.FromUserName;
            var to = e.ToUserName;
            var fromYourPhone = from === self.user.User.UserName && from !== to;

            // When message has been readed on your phone, will receive this message
            if (e.MsgType === 51) {
                return chat.markedRead(fromYourPhone ? from : to);
            }

            e.Content = normalize(e.Content);

            // Sync message from your phone
            if (fromYourPhone) {
                // Message is sync from your phone
                chat.addMessage(e, true);
                return;
            }

            if (from.startsWith('@')) {
                chat.addMessage(e);
            }
        });

        return response.data;
    }

    // A callback for cancel the sync request
    cancelCheck = window.Function;

    checkTimeout(weakup) {
        // Kill the zombie request or duplicate request
        self.cancelCheck();
        clearTimeout(self.checkTimeout.timer);

        if (helper.isSuspend() || weakup) {
            return;
        }

        self.checkTimeout.timer = setTimeout(() => {
            self.cancelCheck();
        }, 30 * 1000);
    }

    async keepalive() {
        var auth = self.auth;
        var response = await axios.post(`/cgi-bin/mmwebwx-bin/webwxsync?sid=${auth.wxsid}&skey=${auth.skey}&lang=en_US&pass_ticket=${auth.passTicket}`, {
            BaseRequest: {
                Sid: auth.wxsid,
                Uin: auth.wxuin,
                Skey: auth.skey,
            },
            SyncKey: self.user.SyncKey,
            rr: ~new Date(),
        });
        var host = axios.defaults.baseURL.replace('//', '//webpush.');
        var loop = async () => {
            // Start detect timeout
            self.checkTimeout();

            var response = await axios.get(`${host}cgi-bin/mmwebwx-bin/synccheck`, {
                cancelToken: new CancelToken(exe => {
                    // An executor function receives a cancel function as a parameter
                    this.cancelCheck = exe;
                }),
                params: {
                    r: +new Date(),
                    sid: auth.wxsid,
                    uin: auth.wxuin,
                    skey: auth.skey,
                    synckey: self.syncKey,
                }
            }).catch(ex => {
                if (axios.isCancel(ex)) {
                    loop();
                } else {
                    self.logout();
                }
            });

            if (!response) {
                // Request has been canceled
                return;
            }

            eval(response.data);

            if (+window.synccheck.retcode === 0) {
                // 2, Has new message
                // 6, New friend
                // 4, Conversation refresh ?
                // 7, Exit or enter
                let selector = +window.synccheck.selector;

                if (selector !== 0) {
                    await self.getNewMessage();
                }

                // Do next sync keep your wechat alive
                return loop();
            } else {
                self.logout();
            }
        };

        // Load the rencets chats
        response.data.AddMsgList.map(
            async e => {
                await chat.loadChats(e.StatusNotifyUserName);
            }
        );

        self.loading = false;
        self.genSyncKey(response.data.SyncCheckKey.List);

        return loop();
    }

    @action async hasLogin() {
        var auth = await storage.get('auth');

        axios.defaults.baseURL = auth.baseURL;

        self.auth = auth && Object.keys(auth).length ? auth : void 0;

        if (self.auth) {
            await self.initUser().catch(ex => self.logout());
            self.keepalive().catch(ex => self.logout());
        }

        return auth;
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
