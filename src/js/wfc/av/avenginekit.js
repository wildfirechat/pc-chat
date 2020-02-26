import MessageContentType from '../messages/messageContentType';
import CallSignalMessageContent from './messages/callSignalMessageContent';
import CallByeMessageContent from './messages/callByeMessageContent';
import CallAnswerMessageContent from './messages/callAnswerMessageContent';
import CallStartMessageContent from './messages/callStartMessageContent';
import CallModifyMessageContent from './messages/callModifyMessageContent';
import ConversationType from '../model/conversationType';
import AVCallEndReason from './avCallEndReason';
import wfc from '../client/wfc';
import avenginekitProxy from './avenginekitproxy'
import CallState from "./callState";
import CallSession from "./CallSession";

export class WfcAVEngineKit {
    currentSession;
    sessionCallback;

    sendMessageCallbackMap;
    sendMessageId = 0;

    setup() {
        avenginekitProxy.listenVoipEvent('message', this.onReceiveMessage);
        avenginekitProxy.listenVoipEvent('sendMessageResult', this.onSendMessage);
        avenginekitProxy.listenVoipEvent('startCall', this.startCall);

        this.sendMessageCallbackMap = new Map();
    }

    onSendMessage = (event, msg) => {
        let cb = this.sendMessageCallbackMap.get(msg.sendMessageId);
        if (cb) {
            cb(msg.error, msg.messageUid, msg.timestamp);
        }
        this.sendMessageCallbackMap.delete(msg.sendMessageId);
    };

    onReceiveMessage = (event, msg) => {
        console.log('receive message ', msg);
        let now = (new Date()).valueOf();
        if ((msg.conversation.type === ConversationType.Single || msg.conversation.type === ConversationType.Group) && msg.timestamp - now < 90 * 1000) { // 需要处理deltatime
            let content = msg.messageContent;
            if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_SIGNAL) {
                if (!self.currentSession || self.currentSession.status === CallState.STATUS_IDLE) {
                    return;
                }

                let signal = msg.messageContent;
                if (signal.callId !== self.currentSession.callId) {
                    self.rejectOtherCall(content.callId, msg.from);
                } else {
                    if (self.currentSession && (self.currentSession.status === CallState.STATUS_CONNECTING
                        || self.currentSession.status === CallState.STATUS_CONNECTED
                        || self.currentSession.status === CallState.STATUS_OUTGOING)) {
                        self.onReceiveData(msg.from, signal.payload);
                    }
                }
            } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_START) {
                if (self.currentSession && self.currentSession.status !== CallState.STATUS_IDLE) {
                    self.rejectOtherCall(content.callId, msg.targetIds);
                } else {
                    self.currentSession = new CallSession();
                    self.currentSession.clientId = msg.from;
                    self.currentSession.callId = content.callId;
                    self.currentSession.audioOnly = content.audioOnly;
                    self.currentSession.conversation = msg.conversation;
                    self.currentSession.starter = msg.from;
                    self.currentSession.inviteMsgUid = msg.messageUid;
                    self.currentSession.setState(CallState.STATUS_INCOMING);
                    self.currentSession.sessionCallback = self.sessionCallback;
                    self.currentSession.initCallUI(false, content.audioOnly, msg.selfUserInfo, msg.participantUserInfos);
                    self.currentSession.setUserJoinTime(msg.from, msg.timestamp);
                    self.currentSession.setUserAcceptTime(msg.from, msg.timestamp);
                }
            } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT
                || msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT_T) {
                if (self.currentSession && self.currentSession.status !== CallState.STATUS_IDLE) {
                    if (content.callId !== self.currentSession.callId) {
                        if (msg.direction === 1) {
                            self.rejectOtherCall(content.callId, msg.from);
                        }
                        return;
                    } else {
                        if (msg.direction === 0 && self.currentSession.status === CallState.STATUS_INCOMING) {
                            self.currentSession.endCall(AVCallEndReason.kWFAVCallEndReasonAcceptByOtherClient);
                        }
                    }

                    if (self.currentSession.status === CallState.STATUS_OUTGOING) {
                        self.currentSession.setState(CallState.STATUS_CONNECTING);
                    }
                    self.currentSession.audioOnly = content.audioOnly;
                    self.currentSession.setUserAcceptTime(msg.from, msg.timestamp);
                    // self.currentSession.startMedia(msg.from, false);
                }
            } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_END) {
                if (!self.currentSession || self.currentSession.status === CallState.STATUS_IDLE
                    || self.currentSession.callId !== content.callId
                    || self.currentSession.clientId !== msg.from) {
                    console.log('invalid bye message, ignore it');
                } else {
                    self.currentSession.endUserCall(msg.from, AVCallEndReason.kWFAVCallEndReasonRemoteHangup);
                }
            } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_MODIFY) {
                if (self.currentSession && self.currentSession.status === CallState.STATUS_CONNECTED
                    && self.currentSession.callId === content.callId
                    && self.currentSession.clientId === msg.from) {
                    if (content.audioOnly) {
                        self.currentSession.audioOnly = true;
                        self.nodifyDowngradeCall();
                    } else {
                        console.log('cannot modify voice call to video call');
                    }

                }
            }
        }
    };

// todo only send to userId
    onCreateAnswerOffer(userId, offer) {
        console.log("send engine offer");
        self.sendSignalingMessage(offer, [userId], true);
    }

// todo only send to userId
    onIceCandidate(userId, candidate) {
        console.log("send engine candidate", candidate);
        self.sendSignalingMessage(candidate, [userId], true);
    }

// TODO conversation -> targetId
    startCall = (event, msg) => {
        let conversation = msg.conversation;
        let audioOnly = msg.audioOnly;
        if (this.currentSession) {
            return;
        }
        let callId = conversation.target + Math.random();
        this.currentSession = new CallSession();
        this.currentSession.clientId = conversation.target;
        this.currentSession.callId = callId;
        this.currentSession.audioOnly = audioOnly;
        this.currentSession.conversation = conversation;
        //TODO selfUserInfo
        this.currentSession.starter = wfc.getUserId();
        // this.currentSession.inviteMsgUid = msg.messageUid;
        self.currentSession.sessionCallback = self.sessionCallback;

        // let userInfo = wfc.getUserInfo(conversation.target);
        this.currentSession.initCallUI(true, audioOnly, msg.selfUserInfo, msg.participantUserInfos);

        this.currentSession.setState(CallState.STATUS_OUTGOING);
        let startMessage = new CallStartMessageContent();
        startMessage.audioOnly = audioOnly;
        startMessage.callId = callId;
        startMessage.targetIds = [conversation.target];

        this.sendSignalMessage(startMessage, this.currentSession.getParticipantIds(), true, (error, messageUid, timestamp) => {
            if (error !== 0) {
                this.currentSession.endCall(AVCallEndReason.kWFAVCallEndReasonSignalError);
            } else {
                this.currentSession.joinTime = timestamp;
                this.currentSession.setAcceptTime(timestamp);
            }
        });
    };

    sendSignalMessage(msg, targetIds, keyMsg, callback) {
        console.log('send signal message', msg);
        let message = {
            "conversation": self.currentSession.conversation,
            "content": msg.encode(),
            "toUsers": targetIds
        };

        if (callback) {
            this.sendMessageId++;
            message.sendMessageId = this.sendMessageId;
            this.sendMessageCallbackMap.set(this.sendMessageId, callback);
        }
        avenginekitProxy.emitToMain("voip-message", message);
    }


    sendSignalingMessage(message, target, isKeyMsg) {
        let signalingMessage = new CallSignalMessageContent();
        signalingMessage.callId = this.currentSession.callId;
        signalingMessage.payload = JSON.stringify(message);
        this.sendSignalMessage(signalingMessage, [target], isKeyMsg);
    }

    rejectOtherCall(callId, targetIds) {
        let byeMessage = new CallByeMessageContent();
        byeMessage.callId = callId;
        this.sendSignalMessage(byeMessage, targetIds, false);
    }

    onReceiveData(userId, data) {
        let signal = JSON.parse(data);
        this.processSignalingMessage(userId, signal);
    }

    processSignalingMessage(userId, signal) {
        console.log("process remote signal:" + signal);
        if (signal.type === 'offer') {
            console.log("set remote offer0");
            // controlAdapter.setRemoteOffer(signal);
            self.currentSession.onReceiveRemoteCreateOffer(userId, signal);
            // this.callWin.webContents.send('setRemoteOffer', JSON.stringify(signal));
        } else if (signal.type === 'answer') {
            // controlAdapter.setRemoteAnswer(signal);
            self.currentSession.onReceiveRemoteAnswerOffer(userId, signal);
            // this.callWin.webContents.send('setRemoteAnswer', JSON.stringify(signal));
        } else if (signal.type === 'candidate') {
            signal.sdpMLineIndex = signal.label;
            signal.sdpMid = signal.id;
            self.currentSession.setRemoteIceCandidate(userId, signal);
            // this.callWin.webContents.send('setRemoteIceCandidate', JSON.stringify(signal));
        } else if (signal.type === 'remove-candidates') {

        } else {
            console.log('unknown type:' + signal.type);
        }
    }

    answerCurrentCall() {
        // let answerTMsg = new CallAnswerTMessageContent();
        // answerTMsg.audioOnly = self.currentSession.audioOnly;
        // answerTMsg.callId = self.currentSession.callId;
        //
        // this.sendSignalMessage(answerTMsg, this.currentSession.conversation.target, true);

        let answerMsg = new CallAnswerMessageContent();
        answerMsg.audioOnly = self.currentSession.audioOnly;
        answerMsg.callId = self.currentSession.callId;
        this.sendSignalMessage(answerMsg, this.currentSession.getParticipantIds(), true, (error, messageUid, timestamp) => {
            if (error === 0) {
                this.currentSession.setAcceptTime(timestamp)
            } else {
                this.currentSession.endCall(AVCallEndReason.kWFAVCallEndReasonSignalError);
            }
        });

    }

    downgrade2VoiceCall() {
        let modifyMsg = new CallModifyMessageContent();
        self.currentSession.audioOnly = true;
        modifyMsg.audioOnly = self.currentSession.audioOnly;
        modifyMsg.callId = self.currentSession.callId;

        this.sendSignalMessage(modifyMsg, this.currentSession.getParticipantIds(), true);
    }
}

const self = new WfcAVEngineKit();
export default self;
