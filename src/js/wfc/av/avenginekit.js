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

    participantUserInfos;
    selfUserInfo;

    setup() {
        avenginekitProxy.listenVoipEvent('message', this.onReceiveMessage)
        avenginekitProxy.listenVoipEvent('startCall', this.startCall)
    }

    onReceiveMessage = (event, msg) => {
        console.log('receive message ', msg);
        var now = (new Date()).valueOf();
        if (msg.conversation.type === ConversationType.Single && msg.timestamp - now < 90 * 1000) { // 需要处理deltatime
            var content = msg.messageContent;
            if (msg.direction === 1 || msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT) {
                if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_SIGNAL) {
                    if (!self.currentSession || self.currentSession.status === CallState.STATUS_IDLE) {
                        return;
                    }

                    var signal = msg.messageContent;
                    if (msg.from !== self.currentSession.clientId || signal.callId !== self.currentSession.callId) {
                        self.rejectOtherCall(content.callId, msg.from);
                    } else {
                        if (self.currentSession && (self.currentSession.status === CallState.STATUS_CONNECTING
                            || self.currentSession.status === CallState.STATUS_CONNECTED
                            || self.currentSession.status === CallState.STATUS_OUTGOING)) {
                            self.onReceiveData(signal.payload);
                        }
                    }
                } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_START) {
                    self.participantUserInfos = msg.participantUserInfos;
                    self.selfUserInfo = msg.selfUserInfo;
                    if (self.currentSession && self.currentSession.status !== CallState.STATUS_IDLE) {
                        self.rejectOtherCall(content.callId, msg.from);
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
                        self.currentSession.initCallUI(false, content.audioOnly, this.participantUserInfos[0]);
                    }
                } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT
                    || msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT_T) {
                    if (self.currentSession && self.currentSession.status !== CallState.STATUS_IDLE) {
                        if (msg.from !== self.currentSession.clientId
                            || content.callId !== self.currentSession.callId) {
                            if (msg.direction === 1 && content.callId !== self.currentSession.callId) {
                                self.rejectOtherCall(content.callId, msg.fromUser);
                            } else {
                                if (self.currentSession.status === CallState.STATUS_INCOMING) {
                                    self.currentSession.endCall(AVCallEndReason.kWFAVCallEndReasonAcceptByOtherClient);
                                }
                            }
                        } else if (self.currentSession.status === CallState.STATUS_CONNECTING
                            || self.currentSession.status === CallState.STATUS_CONNECTED) {

                        } else if (self.currentSession.status !== CallState.STATUS_OUTGOING) {
                            self.rejectOtherCall(content.callId, msg.from);
                        } else if (self.currentSession.status === CallState.STATUS_OUTGOING) {
                            self.currentSession.inviteMsgUid = msg.messageUid;
                            self.currentSession.audioOnly = content.audioOnly;
                            self.currentSession.startMedia(false, self.currentSession.audioOnly);
                        }
                    }
                } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_END) {
                    if (!self.currentSession || self.currentSession.status === CallState.STATUS_IDLE
                        || self.currentSession.callId !== content.callId
                        || self.currentSession.clientId !== msg.from) {
                        console.log('invalid bye message, ignore it');
                    } else {
                        self.currentSession.endCall(AVCallEndReason.kWFAVCallEndReasonRemoteHangup);
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
        }
    };

    onCreateAnswerOffer(offer) {
        console.log("send engine offer");
        self.sendSignalingMessage(offer, true);
    }

    onIceCandidate(candidate) {
        console.log("send engine candidate", candidate);
        self.sendSignalingMessage(candidate, true);
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
        let userInfo = msg.participantUserInfos[0];
        this.currentSession.initCallUI(true, audioOnly, userInfo);

        this.currentSession.setState(CallState.STATUS_OUTGOING);
        let startMessage = new CallStartMessageContent();
        startMessage.audioOnly = audioOnly;
        startMessage.callId = callId;
        startMessage.targetIds = [conversation.target];

        this.sendSignalMessage(startMessage, conversation.target, true);
    };

    sendSignalMessage(msg, targetId, keyMsg) {
        console.log('send signal message', msg);
        let message = {
            "conversation": self.currentSession.conversation,
            "content": msg.encode(),
            "toUsers": []
        };
        avenginekitProxy.emitToMain("voip-message", message);
    }

    sendSignalingMessage(message, isKeyMsg) {
        let signalingMessage = new CallSignalMessageContent();
        signalingMessage.callId = this.currentSession.callId;
        signalingMessage.payload = JSON.stringify(message);
        this.sendSignalMessage(signalingMessage, this.currentSession.clientId, false);
    }

    rejectOtherCall(callId, targetId) {
        let byeMessage = new CallByeMessageContent();
        byeMessage.callId = callId;
        this.sendSignalMessage(byeMessage, targetId, false);
    }

    onReceiveData(data) {
        let signal = JSON.parse(data);
        this.processSignalingMessage(signal);
    }

    processSignalingMessage(signal) {
        console.log("process remote signal:" + signal);
        if (signal.type === 'offer') {
            console.log("set remote offer0");
            // controlAdapter.setRemoteOffer(signal);
            self.currentSession.onReceiveRemoteCreateOffer(signal);
            // this.callWin.webContents.send('setRemoteOffer', JSON.stringify(signal));
        } else if (signal.type === 'answer') {
            // controlAdapter.setRemoteAnswer(signal);
            self.currentSession.onReceiveRemoteAnswerOffer(signal);
            // this.callWin.webContents.send('setRemoteAnswer', JSON.stringify(signal));
        } else if (signal.type === 'candidate') {
            signal.sdpMLineIndex = signal.label;
            signal.sdpMid = signal.id;
            self.currentSession.setRemoteIceCandidate(signal);
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
        this.sendSignalMessage(answerMsg, this.currentSession.conversation.target, true);

    }

    downgrade2VoiceCall() {
        let modifyMsg = new CallModifyMessageContent();
        self.currentSession.audioOnly = true;
        modifyMsg.audioOnly = self.currentSession.audioOnly;
        modifyMsg.callId = self.currentSession.callId;

        this.sendSignalMessage(modifyMsg, this.currentSession.conversation.target, true);
    }
}

const self = new WfcAVEngineKit();
export default self;
