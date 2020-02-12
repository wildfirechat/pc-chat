import {observable, action} from 'mobx';
import axios from 'axios';
import {ipcRenderer, isElectron} from '../../platform'

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
import MessageConfig from "../../wfc/client/messageConfig";
import PersistFlag from "../../wfc/messages/persistFlag";
import MediaMessageContent from "../../wfc/messages/mediaMessageContent";

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

async function updateMenus({conversations = [], contacts = []}) {
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

    initialized = false;

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
                imgs.push({src: src});
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
                    let index = self.messageList.findIndex(m => m.messageUid.equals(message.messageUid));
                    if (index === -1) {
                        self.messageList.push(message);
                    }
                }
            } else {
                let index = self.messageList.findIndex(m => m.messageUid.equals(message.messageUid));
                if (index === -1) {
                    self.messageList.push(message);
                }
            }
        }
    }

    onUserInfosUpdate(userInfos) {
        for (const userInfo of userInfos) {
            if (self.conversation && self.conversation.type === ConversationType.Single && self.conversation.target === userInfo.uid) {
                self.target = userInfo;
                break;
            }
        }
    }

    onGroupInfosUpdate(groupInfos) {
        for (const groupInfo of groupInfos) {
            if (self.conversation && self.conversation.type === ConversationType.Group && self.conversation.target === groupInfo.target) {
                self.target = groupInfo;
                break;
            }
        }
    }

    @action
    async chatToN(conversation) {
        console.log('chat to conversation', conversation);
        if (self.conversation && self.conversation.equal(conversation)) {
            return
        }

        // 第一次进入的时候订阅
        if (!self.initialized) {
            wfc.eventEmitter.on(EventType.ReceiveMessage, self.onReceiveMessage);
            wfc.eventEmitter.on(EventType.RecallMessage, self.onRecallMessage);
            wfc.eventEmitter.on(EventType.UserInfosUpdate, self.onUserInfosUpdate);
            wfc.eventEmitter.on(EventType.GroupInfosUpdate, self.onGroupInfosUpdate);
            self.initialized = true;
        }

        self.conversation = conversation;
        self.loading = false;
        self.hasMore = true;

        self.loadConversationMessages(conversation, 10000000);

        // TODO update observable for chat content
        switch (conversation.type) {
            case ConversationType.Single:
                self.target = wfc.getUserInfo(conversation.target);
                break;
            case ConversationType.Group:
                self.target = wfc.getGroupInfo(conversation.target);
                break;
            default:
                break

        }
    }

    //@action async getMessages(conversation, fromIndex, before = 'true', count = '20', withUser = ''){
    @action
    async loadConversationMessages(conversation, fromIndex, before = true, count = 20) {
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

    @action
    async loadOldMessages() {
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

    @action
    async sendMessage(messageContent, isForward = false) {

        let msg = new Message();
        msg.conversation = self.conversation;
        msg.messageContent = messageContent;
        let m;
        let flag = MessageConfig.getMessageContentPersitFlag(messageContent.type);
        wfc.sendMessage(msg,
            (messageId, timestamp) => {
                if (messageId > 0) {
                    m = wfc.getMessageById(messageId);
                    self.messageList.push(m);
                }
            },
            null,
            (messageUid, timestamp) => {
                if (PersistFlag.Persist === flag || PersistFlag.Persist_And_Count === flag) {
                    m.messageUid = messageUid;
                    m.status = 1;
                    m.timestamp = timestamp;
                }
                if (m instanceof MediaMessageContent) {
                    m.remotePath = wfc.getMessageByUid(messageUid).messageContent.remotePath;
                }
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


    @action
    async process(file, user = self.user) {
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
        wfc.sendMessage(msg,
            function (messageId, timestamp) {
                if (messageId > 0) {
                    let m = wfc.getMessageById(messageId);
                    self.messageList.push(m);
                }
            },
            (current, total) => {
                // progress
            },
            function (messageUid, timestamp) {
                let msg = wfc.getMessageByUid(messageUid);
                if (self.messageList.length > 0) {
                    for (let i = self.messageList.length - 1; i > 0; i--) {
                        if (self.messageList[i].messageId === msg.messageId) {
                            self.messageList[i].messageUid = messageUid;
                            self.messageList[i].messageContent = msg.messageContent;
                            self.messageList[i].status = MessageStatus.Sent;
                            self.messageList[i].timestamp = timestamp;
                            break;
                        }
                    }
                }
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

    @action
    async recallMessage(message) {
        console.log('----------- recallmessage', message.messageId, message.messageUid.toString());
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
