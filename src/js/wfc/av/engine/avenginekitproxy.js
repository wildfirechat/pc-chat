import EventType from "../../client/wfcEvent";
import {AppPath, BrowserWindow, ipcRenderer, isElectron, PostMessageEventEmitter} from "../../../platform";
import ConversationType from "../../model/conversationType";
import MessageContentType from "../../messages/messageContentType";
import wfc from "../../client/wfc";
import MessageConfig from "../../client/messageConfig";
import CallByeMessageContent from "../messages/callByeMessageContent";
import CallEndReason from './callEndReason'

const path = require('path');

// main window renderer process -> voip window renderer process
// voip window renderer process -> main process -> main window renderer process
export class AvEngineKitProxy {
    queueEvents;
    callWin;

    conversation;
    callId;
    participants = [];

    setup(wfc) {
        this.event = wfc.eventEmitter;
        this.event.on(EventType.ReceiveMessage, this.onReceiveMessage);

        if (isElectron()) {
            ipcRenderer.on('voip-message', this.sendVoipListener);
        }
    }

    sendVoipListener = (event, msg) => {

        let contentClazz = MessageConfig.getMessageContentClazz(msg.content.type);

        let content = new contentClazz();
        content.decode(msg.content);
        console.log('to send voip message', content);
        if (content.type === MessageContentType.VOIP_CONTENT_TYPE_ADD_PARTICIPANT) {
            this.participants.push(content.participants);
        } else if (content.type === MessageContentType.VOIP_CONTENT_TYPE_END) {
            this.conversation = null;
            this.callId = null;
            this.participants = [];
            // 仅仅为了通知proxy，其他端已经接听电话了，关闭窗口时，不应当发送挂断信令
            if (!content.callId) {
                return;
            }
        }
        wfc.sendConversationMessage(msg.conversation, content, msg.toUsers, (messageId, timestamp) => {

        }, (uploaded, total) => {

        }, (messageUid, timestamp) => {
            this.emitToVoip('sendMessageResult', {error: 0, sendMessageId: msg.sendMessageId, timestamp: timestamp})
        }, (errorCode) => {
            this.emitToVoip('sendMessageResult', {error: errorCode, sendMessageId: msg.sendMessageId})
        });
    }


    onReceiveMessage = (msg) => {
        let now = (new Date()).valueOf();
        let delta = wfc.getServerDeltaTime();
        if ((msg.conversation.type === ConversationType.Single || msg.conversation.type === ConversationType.Group) && now - (msg.timestamp - delta) < 90 * 1000) {
            let content = msg.messageContent;
            if (content.type === MessageContentType.VOIP_CONTENT_TYPE_START
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_END
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_SIGNAL
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_MODIFY
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT_T
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_ADD_PARTICIPANT
            ) {
                console.log("receive voip message", msg);

                let participantUserInfos = [];
                let selfUserInfo = wfc.getUserInfo(wfc.getUserId());
                if (content.type === MessageContentType.VOIP_CONTENT_TYPE_START) {
                    this.conversation = msg.conversation;
                    this.callId = content.callId;
                    this.participants.push(...content.targetIds);
                    this.participants.push(msg.from);

                    if (msg.conversation.type === ConversationType.Single) {
                        participantUserInfos = [wfc.getUserInfo(msg.from)];
                    } else {
                        let targetIds = content.targetIds.filter(id => id !== selfUserInfo.uid);
                        targetIds.push(msg.from);
                        participantUserInfos = wfc.getUserInfos(targetIds, msg.conversation.target);
                    }
                    if (!this.callWin) {
                        this.showCallUI(msg.conversation);
                    }
                } else if (content.type === MessageContentType.VOIP_CONTENT_TYPE_ADD_PARTICIPANT) {
                    let participantIds = [...content.participants];
                    if (content.existParticipants) {
                        content.existParticipants.forEach(p => {
                            participantIds.push(p.userId);
                        });
                    }

                    this.conversation = msg.conversation;
                    this.callId = content.callId;
                    this.participants.push(...participantIds);

                    participantIds = participantIds.filter(u => u.uid !== selfUserInfo.uid);
                    participantUserInfos = wfc.getUserInfos(participantIds, msg.conversation.target);

                    if (!this.callWin && content.participants.indexOf(selfUserInfo.uid) > -1) {
                        this.showCallUI(msg.conversation);
                    }
                } else if (content.type === MessageContentType.VOIP_CONTENT_TYPE_END) {
                    this.conversation = null;
                    this.callId = null;
                    this.participants = [];
                }

                if (msg.conversation.type === ConversationType.Group
                    && (content.type === MessageContentType.VOIP_CONTENT_TYPE_START
                        || content === MessageContentType.VOIP_CONTENT_TYPE_ADD_PARTICIPANT
                    )) {
                    let memberIds = wfc.getGroupMemberIds(msg.conversation.target);
                    msg.groupMemberUserInfos = wfc.getUserInfos(memberIds, msg.conversation.target);
                }

                msg.participantUserInfos = participantUserInfos;
                msg.selfUserInfo = selfUserInfo;
                this.emitToVoip("message", msg);
            }
        }
    };

    emitToVoip(event, args) {
        if (isElectron()) {
            // renderer/main to renderer
            if (this.callWin) {
                this.callWin.webContents.send(event, args);
            } else if (this.queueEvents) {
                this.queueEvents.push({event, args});
            }
        } else {
            if (this.events) {
                this.events.emit(event, args);
            } else if (this.queueEvents) {
                this.queueEvents.push({event, args});
            }
        }
    }

    listenMainEvent(event, listener) {
        if (isElectron()) {
            // listen for event from main
            ipcRenderer.on(event, listener);
        } else {
            this.events.on(event, listener);
        }
    }

    emitToMain(event, args) {
        console.log('emit to main', event, args);
        if (isElectron()) {
            // renderer to main
            ipcRenderer.send(event, args);
        } else {
            this.events.emit(event, args);
        }
    }

    listenVoipEvent = (event, listener) => {
        if (isElectron()) {
            // listen for event from renderer
            ipcRenderer.on(event, listener);
        } else {
            if (!this.events) {
                this.events = new PostMessageEventEmitter(window.opener, window.location.origin);
            }
            this.events.on(event, listener);
        }
    };

    startCall(conversation, audioOnly, participants) {
        let callId = conversation.target + Math.random();
        this.conversation = conversation;
        this.participants.push(...participants)
        this.callId = callId;

        let selfUserInfo = wfc.getUserInfo(wfc.getUserId());
        let participantUserInfos = wfc.getUserInfos(participants);
        let groupMemberUserInfos;
        if (conversation.type === ConversationType.Group) {
            let memberIds = wfc.getGroupMemberIds(conversation.target);
            groupMemberUserInfos = wfc.getUserInfos(memberIds, conversation.target);
        }
        this.showCallUI(conversation);
        this.emitToVoip('startCall', {
            conversation: conversation,
            audioOnly: audioOnly,
            callId: callId,
            selfUserInfo: selfUserInfo,
            groupMemberUserInfos: groupMemberUserInfos,
            participantUserInfos: participantUserInfos
        });
    }

    showCallUI(conversation) {
        this.queueEvents = [];
        let type = conversation.type === ConversationType.Single ? 'voip-single' : 'voip-multi';
        if (isElectron()) {
            let win = new BrowserWindow(
                {
                    width: 360,
                    height: 640 + 15,
                    resizable: true,
                    maximizable: true,
                    webPreferences: {
                        scrollBounce: true,
                        nativeWindowOpen: true,
                    },
                }
            );

            win.webContents.on('did-finish-load', () => {
                this.onVoipWindowReady(win);
            });
            // win.webContents.openDevTools();
            win.on('close', () => {
                this.onVoipWindowClose();
            });

            win.loadURL(path.join('file://', AppPath, 'src/index.html?' + type));
            win.show();
        } else {
            let win = window.open(window.location.origin + '?' + type, 'target', 'width=360,height=640,left=200,top=200,toolbar=no,menubar=no,resizable=no,location=no, maximizable');
            win.addEventListener('load', () => {
                this.onVoipWindowReady(win);
            }, true);

            win.addEventListener('beforeunload', () => {
                this.onVoipWindowClose();
            });
        }
    }

    onVoipWindowClose() {
        if (this.conversation) {
            let byeMessage = new CallByeMessageContent();
            byeMessage.callId = this.callId;
            wfc.sendConversationMessage(this.conversation, byeMessage, this.participants);
            this.conversation = null;
            this.callId = null;
            this.participants = [];
        }
        this.callWin = null;
        this.voipEventRemoveAllListeners(['message']);
    }

    onVoipWindowReady(win) {
        this.callWin = win;
        if (!isElectron()) {
            this.events = new PostMessageEventEmitter(win, window.location.origin)
            this.events.on('voip-message', this.sendVoipListener)
        }
        if (this.queueEvents.length > 0) {
            this.queueEvents.forEach((eventArgs) => {
                console.log('process queued event');
                this.emitToVoip(eventArgs.event, eventArgs.args);
            })
        }
    }

    voipEventRemoveAllListeners(events = []) {
        if (isElectron()) {
            // renderer
            events.forEach(e => ipcRenderer.removeAllListeners(e));
        } else {
            this.events.stop();
            this.events = null;
        }
    }
}

const self = new AvEngineKitProxy();
export default self;
