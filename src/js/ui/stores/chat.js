
import { observable, action } from 'mobx';
import axios from 'axios';
import { ipcRenderer, isElectron } from '../../platform'

import helper from 'utils/helper';
import contacts from './contacts';
import settings from './settings';
import members from './members';
import snackbar from './snackbar';
import wfc from '../../wfc/client/wfc'
import Message from '../../wfc/messages/message';
import EventType from '../../wfc/client/wfcEvent';
import ConversationType from '../../wfc/model/conversationType';
import MessageContentMediaType from '../../wfc/messages/messageContentMediaType';
import ImageMessageContent from '../../wfc/messages/imageMessageContent';
import VideoMessageContent from '../../wfc/messages/videoMessageContent';
import FileMessageContent from '../../wfc/messages/fileMessageContent';
import MessageStatus from '../../wfc/messages/messageStatus';
import resizeImage from 'resize-image';
import QuitGroupNotification from '../../wfc/messages/notification/quitGroupNotification';
import DismissGroupNotification from '../../wfc/messages/notification/dismissGroupNotification';
import KickoffGroupMemberNotification from '../../wfc/messages/notification/kickoffGroupMemberNotification';

async function resolveMessage(message) {
    var auth = await storage.get('auth');
    var isChatRoom = helper.isChatRoom(message.FromUserName);
    var content = (isChatRoom && !message.isme) ? message.Content.split(':<br/>')[1] : message.Content;

    switch (message.MsgType) {
        case 1:
            // Text message and Location
            if (message.Url && message.OriContent) {
                // This message is a location
                let parts = message.Content.split(':<br/>');
                let location = helper.parseKV(message.OriContent);

                location.image = `${axios.defaults.baseURL}${parts[1]}`.replace(/\/+/g, '/');
                location.href = message.Url;

                message.location = location;
            };
            break;
        case 3:
            // Image
            let image = {};
            image.src = `${axios.defaults.baseURL}cgi-bin/mmwebwx-bin/webwxgetmsgimg?&msgid=${message.MsgId}&skey=${auth.skey}`;
            message.image = image;
            break;

        case 34:
            // Voice
            let voice = {};
            voice.src = `${axios.defaults.baseURL}cgi-bin/mmwebwx-bin/webwxgetvoice?&msgid=${message.MsgId}&skey=${auth.skey}`;
            message.voice = voice;
            break;

        case 47:
            // External emoji
            if (!content) break;

            {
                let emoji = helper.parseKV(content);

                emoji.src = `${axios.defaults.baseURL}cgi-bin/mmwebwx-bin/webwxgetmsgimg?&msgid=${message.MsgId}&skey=${auth.skey}`;
                message.emoji = emoji;
            }
            break;

        case 42:
            // Contact
            let contact = message.RecommendInfo;

            contact.image = `${axios.defaults.baseURL}cgi-bin/mmwebwx-bin/webwxgeticon?seq=0&username=${contact.UserName}&skey=${auth.skey}&msgid=${message.MsgId}`;
            contact.name = contact.NickName;
            contact.address = `${contact.Province || 'UNKNOW'}, ${contact.City || 'UNKNOW'}`;
            message.contact = contact;
            break;

        case 43:
            // Video
            let video = {
                cover: `${axios.defaults.baseURL}cgi-bin/mmwebwx-bin/webwxgetmsgimg?&MsgId=${message.MsgId}&skey=${auth.skey}&type=slave`,
                src: `${axios.defaults.baseURL}cgi-bin/mmwebwx-bin/webwxgetvideo?msgid=${message.MsgId}&skey=${auth.skey}`,
            };

            message.video = video;
            break;

        case 49:
            switch (message.AppMsgType) {
                case 2000:
                    // Transfer
                    let res = helper.parseXml(message.Content, 'des');
                    let value = (res.value || {}).des;

                    message.MsgType += 2000;
                    message.transfer = {
                        desc: value,
                        money: +(value.match(/[\d.]+元/)[0].slice(0, -1)),
                    };
                    break;

                case 17:
                    // Location sharing...
                    message.MsgType += 17;
                    break;

                case 6:
                    // Receive file
                    let file = {
                        name: message.FileName,
                        size: message.FileSize,
                        mediaId: message.MediaId,
                        extension: (message.FileName.match(/\.\w+$/) || [])[0],
                    };

                    file.uid = await helper.getCookie('wxuin');
                    file.ticket = await helper.getCookie('webwx_data_ticket');
                    file.download = `${axios.defaults.baseURL.replace(/^https:\/\//, 'https://file.')}cgi-bin/mmwebwx-bin/webwxgetmedia?sender=${message.FromUserName}&mediaid=${file.mediaId}&filename=${file.name}&fromuser=${file.uid}&pass_ticket=undefined&webwx_data_ticket=${file.ticket}`;

                    message.MsgType += 6;
                    message.file = file;
                    message.download = {
                        done: false,
                    };
                    break;

                case 8:
                    // Animated emoji
                    if (!content) break;

                    {
                        let emoji = helper.parseKV(content) || {};

                        emoji.src = `${axios.defaults.baseURL}cgi-bin/mmwebwx-bin/webwxgetmsgimg?&msgid=${message.MsgId}&skey=${auth.skey}&type=big`;
                        message.MsgType += 8;
                        message.emoji = emoji;
                    }
                    break;

                default:
                    console.error('Unknow app message: %o', Object.assign({}, message));
                    message.Content = `收到一条暂不支持的消息类型，请在手机上查看（${message.FileName || 'No Title'}）。`;
                    message.MsgType = 19999;
                    break;
            }
            break;

        case 10002:
            // Recall message
            let text = isChatRoom ? message.Content.split(':<br/>').slice(-1).pop() : message.Content;
            let { value } = helper.parseXml(text, ['replacemsg', 'msgid']);

            if (!settings.blockRecall) {
                self.deleteMessage(message.FromUserName, value.msgid);
            }

            message.Content = value.replacemsg;
            message.MsgType = 19999;
            break;

        case 10000:
            let userid = message.FromUserName;

            // Refresh the current chat room info
            if (helper.isChatRoom(userid)) {
                let user = await contacts.getUser(userid);

                if (userid === self.user.UserName) {
                    self.chatTo(user);
                }

                if (members.show
                    && members.users.UserName === userid) {
                    members.toggle(true, user);
                }
            }
            break;

        default:
            // Unhandle message
            message.Content = 'Unknow message type: ' + message.MsgType;
            message.MsgType = 19999;
    }

    return message;
}

function hasUnreadMessage(messages) {
    var counter = 0;

    Array.from(messages.keys()).map(
        e => {
            var item = messages.get(e);
            counter += (item.data.length - item.unread);
        }
    );
    if (isElectron()) {
        ipcRenderer.send(
            'message-unread',
            {
                counter,
            }
        );
    } else {
        // TODO

    }
}

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

class Chat {
    // TODO remove
    @observable sessions = [];
    @observable messages = new Map();
    // TODO remove end

    @observable showConversation = false;

    // maybe userInfo, GroupInfo, ChannelInfo, ChatRoomInfo
    @observable target = false;

    @observable conversation;
    loading = false;
    hasMore = true;

    @observable messageList = [];

    @observable previewImage = false;

    toPreivewImageOption = {};

    @action togglePreviewImage(e, show = false, messageId) {
        self.previewImage = show;
        if (self.previewImage) {
            let imgs = [];
            let current = 0;
            let imageMsgs = self.messageList.filter(m => m.messageContent instanceof ImageMessageContent);
            for (let i = 0; i < imageMsgs.length; i++) {
                if (imageMsgs[i].messageId === messageId) {
                    current = i;
                }
                // when in electron, can not load local path
                let src = imageMsgs[i].messageContent.remotePath;
                imgs.push({ src: src });
            }

            self.toPreivewImageOption.images = imgs;
            self.toPreivewImageOption.current = current;
        }
    }

    @action toggleConversation(show = !self.showConversation) {
        self.showConversation = show;
    }
    onRecallMessage(operatorUid, messageUid) {
        let msg = wfc.getMessageByUid(messageUid);
        if (self.conversation && self.conversation.equal(msg.conversation)) {
            let index = self.messageList.findIndex(m => m.messageId === msg.messageId);
            self.messageList[index] = msg;
        }
    }

    onReceiveMessage(message, hasMore) {
        console.log('chat on receive message', message);
        // TODO message id
        if (self.conversation && message.messageId > 0 && self.conversation.equal(message.conversation)) {
            // message conent type
            let content = message.messageContent;
            if (self.conversation.type === ConversationType.Group) {
                if ((content instanceof QuitGroupNotification && content.groupId === self.conversation.target && content.operator === wfc.getUserId())
                    || (content instanceof DismissGroupNotification && content.groupId === self.conversation.target)
                    || (content instanceof KickoffGroupMemberNotification && content.groupId === self.conversation.target && content.kickedMembers.indexOf(wfc.getUserId()) > -1)
                ) {
                    self.target = false;
                    self.conversation = null;
                } else {
                    self.messageList.push(message);
                }
            } else {
                self.messageList.push(message);
            }
        }
    }

    @action async chatToN(conversation) {
        console.log('chat to conversation', conversation);
        if (self.conversation && self.conversation.equal(conversation)) {
            return
        }

        // 第一次进入的时候订阅
        if (self.conversation === undefined) {
            wfc.eventEmitter.on(EventType.ReceiveMessage, self.onReceiveMessage);
        }

        self.conversation = conversation;
        self.loading = false;
        self.hasMore = true;

        self.loadConversationMessages(conversation, 10000000);

        // TODO update observable for chat content
        switch (conversation.type) {
            case ConversationType.Single:
                self.target = wfc.getUserInfo(conversation.target);
                break
            case ConversationType.Group:
                self.target = wfc.getGroupInfo(conversation.target);
                break;
            default:
                break

        }
        // self.user = 'xx'
    }

    //@action async getMessages(conversation, fromIndex, before = 'true', count = '20', withUser = ''){
    @action async loadConversationMessages(conversation, fromIndex, before = true, count = 20) {
        self.messageList = wfc.getMessages(conversation, fromIndex, before, count, '');
        if (!self.messageList || self.messageList.length === 0) {
            wfc.loadRemoteMessages(conversation, 0, 20,
                () => {
                    self.messageList = wfc.getMessages(conversation, fromIndex, before, count, '');
                },
                (errorCode) => {

                });

        }
    }

    @action async loadOldMessages() {
        if (self.loading || !self.hasMore) {
            return;
        }

        if (self.messageList.length <= 0) {
            return;
        }

        if (isElectron()) {
            let fromIndex = self.messageList[0].messageId;
            let msgs = wfc.getMessages(self.conversation, fromIndex);
            if (msgs.length > 0) {
                self.messageList.unshift(...msgs);
            } else {
                self.hasMore = false;
            }
            self.loading = false;
            console.log('loading old message', msgs.length, self.messageList.length);
        } else {
            // TODO has more
            self.loading = true;
            let fromUid = self.messageList[0].messageUid;
            wfc.loadRemoteMessages(self.conversation, fromUid, 20, (msgs) => {
                self.messageList.unshift(...msgs);
                self.loading = false;
            }, (errorCode) => {
                self.loading = false;
            });
        }
    }

    @action chatToPrev() {
        var sessions = self.sessions;
        var index = self.user ? sessions.findIndex(e => e.UserName === self.user.UserName) : 0;

        --index;

        if (index === -1) {
            index = sessions.length - 1;
        }

        self.chatTo(sessions[index]);
    }

    @action chatToNext() {
        var sessions = self.sessions;
        var index = self.user ? sessions.findIndex(e => e.UserName === self.user.UserName) : -1;

        ++index;

        if (index === sessions.length) {
            index = 0;
        }

        self.chatTo(sessions[index]);
    }

    @action async addMessage(message, sync = false) {
        /* eslint-disable */
        var from = message.FromUserName;
        var user = await contacts.getUser(from);
        var list = self.messages.get(from);
        var sessions = self.sessions;
        var stickyed = [];
        var normaled = [];
        /* eslint-enable */

        if (!user) {
            return console.error('Got an invalid message: %o', message);
        }

        // Add the messages of your sent on phone to the chat sets
        if (sync) {
            list = self.messages.get(message.ToUserName);
            from = message.ToUserName;
            user = contacts.memberList.find(e => e.UserName === from);

            message.isme = true;
            message.HeadImgUrl = sessions.user.User.HeadImgUrl;
            message.FromUserName = message.ToUserName;
            message.ToUserName = user.UserName;
        }

        // User is already in the chat set
        if (list) {
            // Swap the chatset order
            let index = self.sessions.findIndex(e => e.UserName === from);

            if (index !== -1) {
                sessions = [
                    ...self.sessions.slice(index, index + 1),
                    ...self.sessions.slice(0, index),
                    ...self.sessions.slice(index + 1, self.sessions.length)
                ];
            } else {
                // When user has removed should add to chat set
                sessions = [user, ...self.sessions];
            }

            // Drop the duplicate message
            if (!list.data.find(e => e.NewMsgId === message.NewMsgId)) {
                let title = user.RemarkName || user.NickName;

                message = await resolveMessage(message);

                if (!helper.isMuted(user)
                    && !sync
                    && settings.showNotification) {
                    let notification = new window.Notification(title, {
                        icon: user.HeadImgUrl,
                        body: helper.getMessageContent(message),
                        vibrate: [200, 100, 200],
                    });

                    notification.onclick = () => {
                        ipcRenderer.send('show-window');
                    };
                }
                list.data.push(message);
            }
        } else {
            // User is not in chat set
            sessions = [user, ...self.sessions];
            list = {
                data: [message],
                unread: 0,
            };
            self.messages.set(from, list);
        }

        if (self.user.UserName === from) {
            // Message has readed
            list.unread = list.data.length;
        }

        sessions = sessions.map(e => {
            // Catch the contact update, eg: MsgType = 10000, chat room name has changed
            var user = contacts.memberList.find(user => user.UserName === e.UserName);

            // Fix sticky bug
            if (helper.isTop(user)) {
                stickyed.push(user);
            } else {
                normaled.push(user);
            }
        });

        self.sessions.replace([...stickyed, ...normaled]);

        hasUnreadMessage(self.messages);
        updateMenus({
            conversations: self.sessions.slice(0, 10),
        });
    }

    transformMessages(to, messages, message) {
        // Sent success
        let list = messages.get(to);
        list.data.push(message);
        return list;
    }

    @action async sendMessage(messgeContent, isForward = false) {

        let msg = new Message();
        msg.conversation = self.conversation;
        msg.messageContent = messgeContent;
        let m;
        wfc.sendMessage(msg,
            (messageId, timestamp) => {
                m = wfc.getMessageById(messageId);
                self.messageList.push(m);
            },
            null,
            (messageUid, timestamp) => {
                m.messageUid = messageUid;
                m.status = 1;
                m.timestamp = timestamp;

            },
            (errorCode) => {
                console.log('send message failed', errorCode);
            }
        );
        return true;
    }

    // return data url
    imageThumbnail(file) {
        return new Promise((resolve, reject) => {
            var img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = () => {
                let resizedCanvas = resizeImage.resize2Canvas(img, 320, 240);
                resizedCanvas.toBlob((blob) => {
                    var reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        let base64data = reader.result;
                        resolve(base64data);
                    }
                    reader.onerror = () => {
                        resolve(null);
                    }
                }, 'image/jpeg', 0.6);
            };
            img.onerror = () => {
                resolve(null);
            }
            if (file.path) {
                img.src = file.path.indexOf(file.name) > -1 ? file.path : file.path + file.name; // local image url
            } else {
                let reader = new FileReader();
                reader.onload = function (event) {
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // return data url
    videoThumbnail(file) {
        return new Promise(
            (resolve, reject) => {
                let video = document.getElementById('bgvid');
                video.onplay = () => {
                    console.log('------------ video onplay');

                    var canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d')
                        .drawImage(video, 0, 0, canvas.width, canvas.height);
                    var img = document.createElement("img");
                    img.src = canvas.toDataURL();
                    img.onload = () => {
                        let resizedCanvas = resizeImage.resize2Canvas(img, 320, 240);
                        resizedCanvas.toBlob((blob) => {
                            var reader = new FileReader();
                            reader.readAsDataURL(blob);
                            reader.onloadend = () => {
                                let base64data = reader.result;
                                resolve(base64data);
                                video.src = null;
                            };
                            reader.onerror = () => {
                                resolve(null);
                            }
                        }, 'image/jpeg', 0.6);
                    };
                    img.onerror = () => {
                        resolve(null);
                    };
                };
                video.onerror = () => {
                    resolve(null);
                };
                if (file.path) {
                    video.src = file.path.indexOf(file.name) > -1 ? file.path : file.path + file.name; // local video url
                } else {
                    let reader = new FileReader();
                    reader.onload = function (event) {
                        video.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
                console.log('----------', video);
            });
    }


    @action async process(file, user = self.user) {
        var showMessage = snackbar.showMessage;

        if (!file || file.size === 0) {
            showMessage('You can\'t send an empty file.');
            return false;
        }

        if (!file
            || file.size >= 100 * 1024 * 1024) {
            showMessage('Send file not allowed to exceed 100M.');
            return false;
        }

        let msg = new Message();
        msg.conversation = self.conversation;

        var mediaType = helper.getMediaType(file.name.split('.').slice(-1).pop());
        var messageContentmediaType = {
            'pic': MessageContentMediaType.Image,
            'video': MessageContentMediaType.Video,
            'doc': MessageContentMediaType.File,
        }[mediaType];

        var messageContent;
        switch (messageContentmediaType) {
            case MessageContentMediaType.Image:
                let imageThumbnail = await self.imageThumbnail(file);
                if (imageThumbnail === null) {
                    return false;
                }
                // let img64 = self.imgDataUriToBase64(imageThumbnail);
                messageContent = new ImageMessageContent(file, null, imageThumbnail.split(',')[1]);
                break;
            case MessageContentMediaType.Video:
                let videoThumbnail = await self.videoThumbnail(file);
                if (videoThumbnail === null) {
                    return false;
                }
                // let video64 = self.imgDataUriToBase64(videoThumbnail);
                messageContent = new VideoMessageContent(file, null, videoThumbnail.split(',')[1]);
                break;
            case MessageContentMediaType.File:
                messageContent = new FileMessageContent(file);
                break;
            default:
                return false;
        }
        msg.messageContent = messageContent;
        var m;
        wfc.sendMessage(msg,
            function (messageId, timestamp) {
                m = wfc.getMessageById(messageId);
                self.messageList.push(m);
            },
            (current, total) => {
                // progress
            },
            function (messageUid, timestamp) {
                let msg = wfc.getMessageByUid(messageUid);
                m.messageUid = messageUid;
                m.messageContent = msg.messageContent;
                m.status = MessageStatus.Sent;
                m.timestamp = timestamp;
            },
            function (errorCode) {
                console.log('send message failed', errorCode);
            }
        );
        return true;
    }

    @action forceRerenderMessage(messageId) {
        let msg = self.messageList.find(m => m.messageId === messageId);
        if (msg) {
            msg.forceRerender = new Date().getTime();
        }
    }

    @action async recallMessage(message) {
        wfc.recallMessage(message.messageUid, () => {
            let msg = wfc.getMessageById(message.messageId);
            let oldMsg = self.messageList.find(m => m.messageId === msg.messageId);
            // extendObservable(oldMsg, msg);
            oldMsg.messageContent = msg.messageContent;
        });
    }

    @action deleteMessage(messageId) {
        let result = wfc.deleteMessage(messageId);
        if (result) {
            var list = self.messageList;
            self.messageList = list.filter(e => e.messageId !== messageId);
        }
    }

    @action markedRead(userid) {
        var list = self.messages.get(userid);

        // Update the unread message need the chat in chat list
        if (!self.sessions.map(e => e.UserName).includes(userid)) {
            return;
        }

        if (list) {
            list.unread = list.data.length;
        } else {
            list = {
                data: [],
                unread: 0,
            };
        }

        self.messages.set(userid, list);
    }

    @action empty(conversation) {
        // Empty the chat content
        self.messageList = [];
        wfc.clearMessages(conversation);
    }
}

const self = new Chat();
export default self;
