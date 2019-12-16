import EventType from '../client/wfcEvent';
import MessageContentType from '../messages/messageContentType';
import CallSignalMessageContent from './messages/callSignalMessageContent';
import CallByeMessageContent from './messages/callByeMessageContent';
import CallAnswerMessageContent from './messages/callAnswerMessageContent';
import CallAnswerTMessageContent from './messages/callAnswerTMessageContent';
import CallStartMessageContent from './messages/callStartMessageContent';
import CallModifyMessageContent from './messages/callModifyMessageContent';
import AVEngineState from './avEngineState';
import AVEngineEvent from './avEngineEvent';
import AVCallEndReason from './avCallEndReason';
import wfc from '../client/wfc';
import controlAdapter from './controlAdapter';

class WfcAVSession {
    callId;
    clientId;
    state;
    startTime;
    connectedTime;
    endTime;
    conversation;
    audioOnly;
    endReason;
    speaker;
    starter;
    conversation;
    inviteMsgUid;
    avEngineKit;

    constructor(kit) {
        this.avEngineKit = kit;
    }

    answerCall(audioOnly) {
        if (this.state !== AVEngineState.kWFAVEngineStateIncomming) {
            return;
        }
        // 不能语音电话来了，视频接听
        if (this.audioOnly && !audioOnly) {
            audioOnly = true;
        }

        this.audioOnly = audioOnly;
        this.avEngineKit.answerCurrentCall();
    }

    downToVoice() {
        if (this.state == AVEngineState.kWFAVEngineStateIncomming) {
            this.answerCall(true);
            return;
        }

        if (this.state !== AVEngineState.kWFAVEngineStateConnected) {
            return;
        }

        if (this.audioOnly) {
            return;
        }
        this.audioOnly = true;
        this.avEngineKit.downgrade2VoiceCall();
    }

    onIceStateChange(msg) {
        if (msg === 'disconnected') {
            this.endCall(AVCallEndReason.kWFAVCallEndReasonMediaError);
        } else if (msg === 'connected') {
            this.setState(AVEngineState.kWFAVEngineStateConnected);
        } else if (msg === 'failed') {
            this.endCall(AVCallEndReason.kWFAVCallEndReasonMediaError);
        }
    }

    endCallByUser() {
        if (this.state === AVEngineState.kWFAVEngineStateIdle) {
            return;
        }
        this.endCall(AVCallEndReason.kWFAVCallEndReasonHangup);
    }

    endCall(reason) {
        if (this.state && this.state === AVEngineState.kWFAVEngineStateIdle) {
            return;
        }

        this.endReason = reason;
        this.setState(AVEngineState.kWFAVEngineStateIdle)

        if (reason !== AVCallEndReason.kWFAVCallEndReasonAcceptByOtherClient) {
            let byeMessage = new CallByeMessageContent();
            byeMessage.callId = this.callId;
            this.avEngineKit.sendSignalMessage(byeMessage, this.clientId, false);
        }

        this.clientId = '';
        this.endTime = (new Date()).valueOf();

        this.avEngineKit.endMedia();

        // Todo stop capture
        // emit call end reason
        // end media
    }

    setState(newState) {
        this.state = newState;
    }
}

export class WfcAVEngineKit {
    event;
    currentSession;

    setup(wfc) {
        this.event = wfc.eventEmitter;
        this.event.on(EventType.ReceiveMessage, this.onReceiveMessage);
    }

    onReceiveMessage = (msg) => {
        console.log('reveive message ', msg);
        var now = (new Date()).valueOf();
        if (msg.timestamp - now < 90 * 1000) { // 需要处理deltatime
            var content = msg.messageContent;
            if (msg.direction === 1 || msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT) {
                if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_SIGNAL) {
                    if (!self.currentSession || self.currentSession.state === AVEngineState.kWFAVEngineStateIdle) {
                        return;
                    }

                    var signal = msg.messageContent;
                    if (msg.from !== self.currentSession.clientId || signal.callId !== self.currentSession.callId) {
                        self.rejectOtherCall(content.callId, msg.fromUser);
                    } else {
                        if (self.currentSession && (self.currentSession.state === AVEngineState.kWFAVEngineStateConnecting || self.currentSession.state === AVEngineState.kWFAVEngineStateConnected)) {
                            self.onReceiveData(signal.payload);
                        } else if (self.currentSession && self.currentSession.state === AVEngineState.kWFAVEngineStateOutgoing) {
                            console.log('signal message come too early!');
                        }
                    }
                } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_START) {
                    if (content.targetId !== wfc.getUserId()) {
                        return;
                    }
                    if (self.currentSession && self.currentSession.state !== AVEngineState.kWFAVEngineStateIdle) {
                        self.rejectOtherCall(content.callId, msg.fromUser);
                    } else {
                        self.currentSession = new WfcAVSession(self);
                        self.currentSession.avEngineKit = self;
                        self.currentSession.clientId = msg.from;
                        self.currentSession.callId = content.callId;
                        self.currentSession.audioOnly = content.audioOnly;
                        self.currentSession.conversation = msg.conversation;
                        self.currentSession.starter = msg.fromUser;
                        self.currentSession.inviteMsgUid = msg.messageUid;
                        self.currentSession.setState(AVEngineState.kWFAVEngineStateIncomming);
                        self.avEngineKit = self;
                        self.event.emit(AVEngineEvent.kDidReceiveCall, self.currentSession);
                        self.showCallUI(false, content.audioOnly);
                    }
                } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT
                    || msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_ACCEPT_T) {
                    if (self.currentSession && self.currentSession.state !== AVEngineState.kWFAVEngineStateIdle) {
                        if (msg.from !== self.currentSession.clientId
                            || content.callId !== self.currentSession.callId) {
                            if (msg.direction === 1 && content.callId !== self.currentSession.callId) {
                                self.rejectOtherCall(content.callId, msg.fromUser);
                            } else {
                                if (self.currentSession.state === AVEngineState.kWFAVEngineStateIncomming) {
                                    self.currentSession.endCall(AVCallEndReason.AVCallEndReason.kWFAVCallEndReasonAcceptByOtherClient);
                                }
                            }
                        } else if (self.currentSession.state === AVEngineState.kWFAVEngineStateConnecting || self.currentSession.state === AVEngineState.kWFAVEngineStateConnected) {

                        } else if (self.currentSession.state !== AVEngineState.kWFAVEngineStateOutgoing) {
                            self.rejectOtherCall(content.callId, msg.fromUser);
                        } else if (self.currentSession.state === AVEngineState.kWFAVEngineStateOutgoing) {
                            self.currentSession.inviteMsgUid = msg.messageUid;
                            self.currentSession.audioOnly = content.audioOnly;
                            self.startMedia(false);
                        }
                    }
                } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_END) {
                    if (!self.currentSession || self.currentSession.state === AVEngineState.kWFAVEngineStateIdle
                        || self.currentSession.callId !== content.callId
                        || self.currentSession.clientId !== msg.from) {
                        console.log('invalid bye message, ignore it');
                    } else {
                        self.currentSession.endCall(AVCallEndReason.kWFAVCallEndReasonRemoteHangup);
                    }
                } else if (msg.messageContent.type === MessageContentType.VOIP_CONTENT_TYPE_MODIFY) {
                    if (self.currentSession && self.currentSession.state === AVEngineState.kWFAVEngineStateConnected
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
    }

    startMedia(isInitiator) {
        console.log('start media');
        self.currentSession.setState(AVEngineState.kWFAVEngineStateConnecting);
        controlAdapter.startMedia(isInitiator, self.currentSession.audioOnly);
        // this.callWin.webContents.send('startMedia', { 'isInitiator': isInitiator, 'audioOnly': self.currentSession.audioOnly });
    }

    nodifyDowngradeCall() {
        controlAdapter.downgrade2Voice();
        // this.callWin.webContents.send('downgrade2Voice');
    }
    endMedia() {
        controlAdapter.endMedia();
        // this.callWin.webContents.send('endMedia');
        self.currentSession = null;
        controlAdapter.destory();
    }

    onCallWindowClose() {
        if (self.currentSession && self.currentSession.state !== AVEngineState.kWFAVEngineStateIdle) {
            self.currentSession.endCallByUser();
        }
    }

    onReceiveOffer() {

    }

    onCreateAnswerOffer(offer) {
        console.log("send engine offer");
        self.sendSignalingMessage(offer, true);
    }

    onIceCandidate(candidate) {
        console.log("send engine candidate");
        self.sendSignalingMessage(candidate, true);
    }

    onIceStateChange(newState) {
        if (self.currentSession) {
            self.currentSession.onIceStateChange(newState);
        }
    }

    answerCall() {
        if (self.currentSession) {
            self.currentSession.answerCall(false);
        }
    }

    hangup() {
        if (self.currentSession) {
            self.currentSession.endCallByUser();
        }
    }

    downToVoice() {
        if (self.currentSession) {
            self.currentSession.downToVoice();
        }
    }
    showCallUI(isMoCall, audioOnly) {
        //   controlAdapter.setOnCallWindowsClose(self.onCallWindowClose);
        controlAdapter.setOnReceiveOffer(self.onReceiveOffer);
        controlAdapter.setOnCreateAnswerOffer(self.onCreateAnswerOffer);
        controlAdapter.setOnIceCandidate(self.onIceCandidate);
        controlAdapter.setOnIceStateChange(self.onIceStateChange);

        controlAdapter.setOnCallButton(self.answerCall);
        controlAdapter.setOnHangupButton(self.hangup);
        controlAdapter.setDownToVoice(self.downToVoice);


        let user = wfc.getUserInfo(self.currentSession.conversation.target);
        controlAdapter.showCallUI(isMoCall, audioOnly, user);
    }

    // TODO conversation -> targetId
    startCall(conversation, audioOnly) {
        let callId = conversation.target + Math.random();
        this.currentSession = new WfcAVSession(this);
        this.currentSession.avEngineKit = this;
        this.currentSession.clientId = conversation.target;
        this.currentSession.callId = callId;
        this.currentSession.audioOnly = audioOnly;
        this.currentSession.conversation = conversation;
        this.currentSession.starter = wfc.getUserId();
        // this.currentSession.inviteMsgUid = msg.messageUid;
        this.currentSession.setState(AVEngineState.kWFAVEngineStateOutgoing);
        this.avEngineKit = this;

        this.showCallUI(true, audioOnly);

        let startMessage = new CallStartMessageContent();
        startMessage.audioOnly = audioOnly;
        startMessage.callId = callId;
        startMessage.targetId = conversation.target;

        this.sendSignalMessage(startMessage, conversation.target, true);
    }

    sendSignalMessage(msg, targetId, keyMsg) {
        wfc.sendConversationMessage(self.currentSession.conversation, msg, [], function (messageId, timestamp) {

        }, function (uploaded, total) {

        }, function (messageUid, timestamp) {

        }, function (errorCode) {

        });
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
            controlAdapter.setRemoteOffer(signal);
            // this.callWin.webContents.send('setRemoteOffer', JSON.stringify(signal));
        } else if (signal.type === 'answer') {
            controlAdapter.setRemoteAnswer(signal);
            // this.callWin.webContents.send('setRemoteAnswer', JSON.stringify(signal));
        } else if (signal.type === 'candidate') {
            signal.sdpMLineIndex = signal.label;
            signal.sdpMid = signal.id;
            controlAdapter.setRemoteIceCandidate(signal);
            // this.callWin.webContents.send('setRemoteIceCandidate', JSON.stringify(signal));
        } else if (signal.type === 'remove-candidates') {

        } else {
            console.log('unknown type:' + signal.type);
        }
    }

    answerCurrentCall() {
        let answerTMsg = new CallAnswerTMessageContent();
        answerTMsg.audioOnly = self.currentSession.audioOnly;
        answerTMsg.callId = self.currentSession.callId;

        this.sendSignalMessage(answerTMsg, this.currentSession.conversation.target, true);

        let answerMsg = new CallAnswerMessageContent();
        answerMsg.audioOnly = self.currentSession.audioOnly;
        answerMsg.callId = self.currentSession.callId;
        this.sendSignalMessage(answerMsg, this.currentSession.conversation.target, true);

        this.startMedia(true, self.currentSession.audioOnly);
    }

    downgrade2VoiceCall() {
        let modifyMsg = new CallModifyMessageContent();
        self.currentSession.audioOnly = true;
        modifyMsg.audioOnly = self.currentSession.audioOnly;
        modifyMsg.callId = self.currentSession.callId;

        this.sendSignalMessage(modifyMsg, this.currentSession.conversation.target, true);

        this.nodifyDowngradeCall();
    }
}

const self = new WfcAVEngineKit();
export default self;
