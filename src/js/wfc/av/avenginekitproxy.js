import EventType from "../client/wfcEvent";
import {AppPath, BrowserWindow, ipcRenderer, isElectron, PostMessageEventEmitter} from "../../platform";
import ConversationType from "../model/conversationType";
import MessageContentType from "../messages/messageContentType";
import wfc from "../client/wfc";
import MessageConfig from "../client/messageConfig";

const path = require('path');

// main window renderer process -> voip window renderer process
// voip window renderer process -> main process -> main window renderer process
export class AvEngineKitProxy {
    queueEvents;
    callWin;

    setup(wfc) {
        this.event = wfc.eventEmitter;
        this.event.on(EventType.ReceiveMessage, this.onReceiveMessage);

        this.listenMainEvent('voip-message', (event, msg) => {
            // TODO construct message object
            let contentClazz = MessageConfig.getMessageContentClazz(msg.content.type);

            let content = new contentClazz();
            content.decode(msg.content);
            console.log('to send voip message', content);
            wfc.sendConversationMessage(msg.conversation, content, msg.toUsers, function (messageId, timestamp) {

            }, function (uploaded, total) {

            }, function (messageUid, timestamp) {

            }, function (errorCode) {

            });
        });

    }

    onReceiveMessage = (msg) => {
        let now = (new Date()).valueOf();
        // 需要处理deltatime
        if (msg.conversation.type === ConversationType.Single && msg.timestamp - now < 90 * 1000) {
            let content = msg.messageContent;
            if (content.type === MessageContentType.VOIP_CONTENT_TYPE_START
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_END
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_SIGNAL
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_MODIFY
                || content.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT_T
            ) {
                if (!this.callWin && content.type === MessageContentType.VOIP_CONTENT_TYPE_START) {
                    let userInfo = wfc.getUserInfo(msg.from);
                    this.showCallUI(false, content.audioOnly, userInfo);
                }
                this.emitToVoip("message", msg);
            }
        }
    };

    emitToVoip(event, args) {
        if (isElectron()) {
            // renderer/main to renderer
            if (this.callWin) {
                this.callWin.webContents.send(event, args);
            } else {
                this.queueEvents.push({event, args});
            }
        } else {
            if (this.events) {
                this.events.emit(event, args);
            } else {
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
        if (isElectron()) {
            // renderer to main
            console.log('emit to main', event, args);
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
            this.events.on(event, listener);
        }
    };

    startCall(conversation, audioOnly) {
        let userInfo = wfc.getUserInfo(conversation.target);
        this.showCallUI(true, audioOnly, userInfo);
        this.emitToVoip('startCall', {conversation: conversation, audioOnly: audioOnly});
    }

    showCallUI(isMoCall, audioOnly, targetUserInfo) {
        this.queueEvents = [];
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
                this.callWin = null;
                this.voipEventRemoveAllListeners(['message']);
            });

            win.loadURL(path.join('file://', AppPath, 'src/index.html?voip'));
            win.show();
        } else {
            let win = window.open(window.location.origin + '?voip', 'target', 'width=360,height=640,left=200,top=200,toolbar=no,menubar=no,resizable=no,location=no, maximizable');
            win.addEventListener('load', () => {
                this.onVoipWindowReady(win);
            }, true);
        }
    }

    onVoipWindowReady(win) {
        this.callWin = win;
        if (!isElectron()) {
            this.events = new PostMessageEventEmitter(win, window.location.origin)
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
        }
    }
}

const self = new AvEngineKitProxy();
export default self;
