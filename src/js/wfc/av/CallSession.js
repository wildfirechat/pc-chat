import Config from '../../config.js';
import CallState from "./callState";
import avenginekit from './avenginekit'
import CallEndReason from "./callEndReason";
import CallByeMessageContent from "./messages/callByeMessageContent";
import PeerConnectionClient from "./PeerConnectionClient";
import {currentWindow} from '../../platform'

// 运行在新的voip window
export default class CallSession {
    static iceServers = [{
        urls: [Config.ICE_ADDRESS],
        username: Config.ICE_USERNAME,
        credential: Config.ICE_PASSWORD
    }];
    callId;
    joinTime = 0;
    acceptTime = 0;
    connectedTime;
    endTime;
    endReason;
    conversation;

    status = 0;
    audioOnly = false;
    muted = false;

    initiatorId;
    participantUserInfos;
    selfUserInfo;

    moCall; // true, outgoing; false, incoming
    pcSetuped;
    queuedOffer;
    pooledSignalingMsg = [];
    startTime;
    localStream;
    remoteStream;
    callTimer;

    sessionCallback;

    peerConnectionClientMap;

    static newSession(conversation, initiatorId, callId, audioOnly, sessionCallback) {
        let session = new CallSession();
        session.conversation = conversation;
        session.initiatorId = initiatorId;
        session.callId = callId;
        session.audioOnly = audioOnly;
        session.sessionCallback = sessionCallback;
        return session;
    }

    getClient(userId) {
        return this.peerConnectionClientMap.get(userId);
    }

    getParticipantIds() {
        let ids = [];
        this.participantUserInfos.forEach(u => {
            ids.push(u.uid);
        });
        return ids;
    }

    setAcceptTime(timestamp) {
        this.acceptTime = timestamp;
        this.tryStartMedia();
    }

    setUserAcceptTime(userId, timestamp) {
        let client = this.getClient(userId);
        client.acceptTime = timestamp;
        this.tryStartMedia()
    }

    setUserJoinTime(userId, timestamp) {
        let client = this.getClient(userId);
        client.joinTime = timestamp;
    }

    tryStartMedia() {
        if (this.acceptTime > 0) {
            this.peerConnectionClientMap.forEach((client, userId) => {
                if (client.acceptTime > 0
                    && (client.status === CallState.STATUS_INCOMING || client.status === CallState.STATUS_OUTGOING)) {
                    if (client.acceptTime < this.acceptTime) {
                        this.startMedia(userId, true);
                    } else {
                        this.startMedia(userId, false);
                    }
                }
            }, this);
        }
    }

    getPeerConnection(userId) {
        let client = this.peerConnectionClientMap.get(userId);
        return client.peerConnection;
    }

    answerCall(audioOnly) {
        if (this.status !== CallState.STATUS_INCOMING) {
            return;
        }
        // 不能语音电话来了，视频接听
        if (this.audioOnly && !audioOnly) {
            audioOnly = true;
        }

        this.audioOnly = audioOnly;
        avenginekit.answerCurrentCall();
    }

    setState(status) {
        this.status = status;
        console.log('set status', status);
        if (this.sessionCallback) {
            this.sessionCallback.didChangeState(status);
        }
    }

    setAudioOnly(audioOnly) {
        this.audioOnly = audioOnly;
        if (this.sessionCallback) {
            this.sessionCallback.didChangeMode(audioOnly);
        }
    }

    drainOfferMessage() {
        if (!this.queuedOffer) {
            return false;
        }

        this.onReceiveRemoteCreateOffer(this.queuedOffer.userId, this.queuedOffer.desc);
        this.queuedOffer = null;
    }

    // TODO 可能没啥用了
    queueOfferMessage(desc) {
        this.queuedOffer = desc;
    }

    playIncomingRing() {
        // TODO
        //在界面初始化时播放来电铃声
    }

    stopIncomingRing() {
        // TODO
        //再接听/语音接听/结束媒体时停止播放来电铃声，可能有多次，需要避免出问题
    }

    initSession(moCall, selfUserInfo, participantUserInfos) {
        this.moCall = moCall;
        this.selfUserInfo = selfUserInfo;
        this.participantUserInfos = participantUserInfos;

        this.sessionCallback.onInitial(this, selfUserInfo, participantUserInfos);

        this.initParticipantClientMap(participantUserInfos);

        if (moCall) {
            this.setState(CallState.STATUS_OUTGOING);
            this.startPreview(audioOnly);
        } else {
            this.setState(CallState.STATUS_INCOMING);
            this.playIncomingRing();
        }
    }

    initParticipantClientMap(participantUserInfos) {
        if (!this.peerConnectionClientMap) {
            this.peerConnectionClientMap = new Map();
        }
        participantUserInfos.forEach(u => {
            let client = new PeerConnectionClient(u.uid, this);
            if (u.uid === this.selfUserInfo.uid) {
                client.status = CallState.STATUS_OUTGOING;
            } else {
                client.status = CallState.STATUS_INCOMING;
            }
            this.peerConnectionClientMap.set(u.uid, client);
        }, this);
    }

    addNewParticipant(newParticipants, newParticipantUserInfos) {
        newParticipants.forEach(p => {
            let client = new PeerConnectionClient(p, this);
            client.status = CallState.STATUS_INCOMING;
            this.peerConnectionClientMap.set(p, client);
        }, this);

        newParticipantUserInfos.forEach(u => {
            this.participantUserInfos.push(u);
            this.sessionCallback && this.sessionCallback.didParticipantJoined(u.uid, u)
            ;
        }, this);
    }

    updateExistParticipant(existParticipants) {
        existParticipants.forEach(p => {
            let client = this.getClient(p.userId);
            client.status = CallState.STATUS_INCOMING;
            client.joinTime = p.joinTime;
            client.videoMuted = p.videoMuted;
            client.acceptTime = p.acceptTime;
        });
    }

    async startPreview(audioOnly) {
        console.log('start preview');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: !audioOnly});
            console.log('Received local stream', stream);
            if (this.sessionCallback) {
                this.sessionCallback.didCreateLocalVideoTrack(stream);
            }
            // this.localVideo.srcObject = stream;
            this.localStream = stream;

            const videoTracks = this.localStream.getVideoTracks();
            if (!audioOnly) {
                if (videoTracks && videoTracks.length > 0) {
                    console.log(`Using video device: ${videoTracks[0].label}`);
                }
            } else {
                if (videoTracks && videoTracks.length > 0) {
                    videoTracks.forEach(track => track.stop());
                }
            }

            const audioTracks = this.localStream.getAudioTracks();
            if (audioTracks.length > 0) {
                console.log(`Using audio device: ${audioTracks[0].label}`);
            }
        } catch (e) {
            console.error('getUserMedia error', e);
            alert(`getUserMedia() error: ${e.name}`);
            this.endCall(CallEndReason.REASON_MediaError);
        }
    }


    async startMedia(userId, isInitiator) {
        console.log('start media', isInitiator);
        this.setState(CallState.STATUS_CONNECTING);
        this.startTime = window.performance.now();
        let client = this.getClient(userId);
        client.status = CallState.STATUS_CONNECTING;
        if (!this.localStream) {
            this.startPreview(this.audioOnly).then(() => {
                console.log('start pc 0');
                this.createPeerConnection(userId, isInitiator);
            });
        } else {
            console.log('start pc 1');
            this.createPeerConnection(userId, isInitiator);
        }
    }

    async createPeerConnection(userId, isInitiator) {
        let client = this.getClient(userId);
        let configuration = this.getSelectedSdpSemantics();
        configuration.iceServers = CallSession.iceServers;
        console.log('RTCPeerConnection configuration:', configuration);

        let pc = new RTCPeerConnection(configuration);
        client.peerConnection = pc;
        client.isInitiator = isInitiator;

        console.log('Created local peer connection object pc');
        pc.addEventListener('icecandidate', e => this.onIceCandidate(userId, pc, e));

        pc.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(userId, pc, e));
        pc.addEventListener('track', e => this.gotRemoteStream(userId, e));

        if (!this.audioOnly) {
            this.localStream.getTracks().forEach(track => pc.addTrack(track, this.localStream), this);
        } else {
            this.localStream.getAudioTracks().forEach(track => pc.addTrack(track, this.localStream), this);
        }
        console.log('Added local stream to pc');

        if (isInitiator) {
            try {
                console.log('pc createOffer start');
                let offerOptions = {
                    offerToReceiveAudio: 1,
                    offerToReceiveVideo: !this.audioOnly
                };
                const offer = await pc.createOffer(offerOptions);
                let mutableOffer = JSON.parse(JSON.stringify(offer));
                mutableOffer.type = 'offer';
                await this.onCreateOfferSuccess(userId, offer);
            } catch (e) {
                this.onCreateSessionDescriptionError(userId, e);
            }
        }

        this.drainOfferMessage();

    }


    getSelectedSdpSemantics() {
        // const sdpSemanticsSelect = document.querySelector('#sdpSemantics');
        // const option = sdpSemanticsSelect.options[sdpSemanticsSelect.selectedIndex];
        // return option.value === '' ? {} : { sdpSemantics: option.value };
        return {};
    }

    call() {
        console.log('voip on call button click');
        this.stopIncomingRing();

        console.log('on call button call');
        this.answerCall(this.audioOnly);
    }

    onCreateSessionDescriptionError(userId, error) {
        console.log('Failed to create session description');
        // console.log(`Failed to create session description: ${error.toString()}`);
        this.endUserCall(userId, CallEndReason.REASON_MediaError);
    }

    drainOutSignalingMessage() {
        console.log('drain pooled msg');
        console.log(this.pooledSignalingMsg.length);
        this.pooledSignalingMsg.forEach((message) => {
            console.log('popup pooled message');
            console.log(message);
            this.onReceiveRemoteIceCandidate(message.userId, message.message);
        });
    }

    async onReceiveRemoteCreateOffer(userId, desc) {
        console.log('pc setRemoteDescription start');
        if (this.status !== CallState.STATUS_CONNECTING && this.status !== CallState.STATUS_CONNECTED) {
            this.queueOfferMessage({
                userId,
                desc
            });
            return;
        }
        let pc = this.getPeerConnection(userId);
        try {
            await pc.setRemoteDescription(desc);
            this.onSetRemoteSuccess(pc);
        } catch (e) {
            this.onSetSessionDescriptionError(userId, e);
        }

        console.log('pc createAnswer start');
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        try {
            const answer = await pc.createAnswer();
            let mutableAnswer = JSON.parse(JSON.stringify(answer));
            mutableAnswer.type = 'answer';
            await this.onCreateAnswerSuccess(userId, answer);
        } catch (e) {
            this.onCreateSessionDescriptionError(e);
        }
    }

    async onCreateOfferSuccess(userId, desc) {
        console.log(`Offer from pc\n${desc.sdp}`);
        console.log('pc setLocalDescription start');
        let pc = this.getPeerConnection(userId);
        try {
            await pc.setLocalDescription(desc);
            this.onSetLocalSuccess(pc);
            this.pcSetuped = true;
            this.drainOutSignalingMessage();
        } catch (e) {
            this.onSetSessionDescriptionError(userId, e);
        }

        console.log(desc);
        avenginekit.onCreateAnswerOffer(userId, desc);
    }

    onSetLocalSuccess(pc) {
        console.log(`setLocalDescription complete`);
    }

    onSetRemoteSuccess(pc) {
        console.log(`setRemoteDescription complete`);
    }

    onSetSessionDescriptionError(userId, error) {
        console.log(`Failed to set session description: ${userId}`);
        console.error(error);
        this.endUserCall(userId, CallEndReason.REASON_MediaError)
    }

    gotRemoteStream = (userId, e) => {
        if (this.remoteStream !== e.streams[0]) {
            if (this.sessionCallback) {
                this.sessionCallback.didReceiveRemoteVideoTrack(userId, e.streams[0]);
            }
            // this.remoteVideo.srcObject = e.streams[0];
            console.log('pc received remote stream', e.streams[0]);
        }
    };

    async onReceiveRemoteAnswerOffer(userId, desc) {
        console.log('pc setRemoteDescription start');
        try {
            let pc = this.getPeerConnection(userId);
            await pc.setRemoteDescription(desc);
            this.onSetRemoteSuccess(pc);
        } catch (e) {
            this.onSetSessionDescriptionError(userId, e);
        }
    }

    async setRemoteIceCandidate(userId, message) {
        if (!this.pcSetuped) {
            console.log('pc not setup yet pool it');
            this.pooledSignalingMsg.push({userId, message});
        } else {
            console.log('handle the candidiated');
            this.onReceiveRemoteIceCandidate(userId, message);
        }
    }

    async onCreateAnswerSuccess(userId, desc) {
        console.log(`Answer from pc:\n${desc.sdp}`);
        console.log('pc setLocalDescription start');
        try {
            let pc = this.getPeerConnection(userId);
            await pc.setLocalDescription(desc);
            this.onSetLocalSuccess(pc);
            this.pcSetuped = true;
            this.drainOutSignalingMessage();
        } catch (e) {
            this.onSetSessionDescriptionError(userId, e);
        }
        console.log(desc);
        avenginekit.onCreateAnswerOffer(userId, desc);
    }

    async onReceiveRemoteIceCandidate(userId, message) {
        console.log('on receive remote ice candidate');
        let pc = this.getPeerConnection(userId);
        await pc.addIceCandidate(message);
    }

    onIceCandidate = (userId, pc, event) => {
        if (!event.candidate) {
            return;
        }
        try {
            let candidate = {
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            };
            avenginekit.onIceCandidate(userId, candidate);
            this.onAddIceCandidateSuccess(userId, pc);
        } catch (e) {
            this.onAddIceCandidateError(userId, pc, e);
        }
        console.log(`ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
    };

    onAddIceCandidateSuccess(userId, pc) {
        console.log(`send Ice Candidate success`);
    }

    onAddIceCandidateError(userId, pc, error) {
        console.log(`failed to add ICE Candidate: ${userId} ${error.toString()}`);
        this.endUserCall(userId, CallEndReason.REASON_MediaError);
    }


    onIceStateChange = (userId, pc, event) => {
        if (pc) {
            let client = this.getClient(userId);
            console.log(`ICE state: ${pc.iceConnectionState}`, pc);
            console.log('ICE state change event: ', event);
            if (pc.iceConnectionState === 'connected') {
                this.setState(CallState.STATUS_CONNECTED);
                client.status = CallState.STATUS_CONNECTED;
            }
            if (pc.iceConnectionState === 'disconnected') {
                this.endUserCall(userId, CallEndReason.REASON_MediaError);
            } else if (pc.iceConnectionState === 'connected') {
                this.setState(CallState.STATUS_CONNECTED);
            } else if (pc.iceConnectionState === 'failed') {
                this.endUserCall(userId, CallEndReason.REASON_MediaError);
            }
        }
    };

    hangup() {
        console.log('Ending call');
        this.endCall(CallEndReason.REASON_Hangup);
    }

    triggerMicrophone() {
        console.log('trigger microphone');
        if (this.localStream) {
            const audioTracks = this.localStream.getAudioTracks();
            if (audioTracks && audioTracks.length > 0) {
                audioTracks[0].enabled = !audioTracks[0].enabled;
                this.muted = !this.muted;
            }
        }
    }

    // 回落到语音
    downgrade2Voice() {
        if (this.status !== CallState.STATUS_CONNECTED) {
            return
        }

        const localVideoTracks = this.localStream.getVideoTracks();
        if (localVideoTracks && localVideoTracks.length > 0) {
            localVideoTracks.forEach(track => track.stop());
        }

        this.downToVoice();
    }

    // 语音接听
    downToVoice() {
        console.log('down to voice');
        this.stopIncomingRing();
        if (this.status === CallState.STATUS_INCOMING) {
            this.answerCall(true);
            return;
        }

        if (this.status !== CallState.STATUS_CONNECTED) {
            return;
        }

        if (this.audioOnly) {
            return;
        }
        this.setAudioOnly(true);
        avenginekit.downgrade2VoiceCall();
    }

    endMedia() {
        console.log('Ending media');
        this.setState(CallState.STATUS_IDLE);
        this.stopIncomingRing();//可能没有接听就挂断了

        if (this.localStream) {
            if (typeof this.localStream.getTracks === 'undefined') {
                // Support legacy browsers, like phantomJs we use to run tests.
                this.localStream.stop();
            } else {
                this.localStream.getTracks().forEach(function (track) {
                    track.stop();
                });
            }
            this.localStream = null;
        }

        // TODO close all
        // if (this.pc) {
        //     this.pc.close();
        //     this.pc = null;
        // }

        // 停几秒，显示通话时间，再结束
        // 页面释放有问题没有真正释放掉
        // eslint-disable-next-line no-const-assign
        // TODO 放到也没去
        setTimeout(() => {
            if (currentWindow) {
                currentWindow.close();
            } else {
                window.close();
            }
        }, 2000);
    }

    endUserCall(userId, reason) {
        if (userId === this.selfUserInfo.uid) {
            this.endCall(reason);
            return;
        }

        let client = this.getClient(userId);
        if (client) {
            if (client.peerConnection) {
                client.peerConnection.close();
            }
            this.peerConnectionClientMap.delete(userId);
            if (this.sessionCallback) {
                this.sessionCallback.didParticipantLeft(userId, reason);
            }
        }

        if (this.peerConnectionClientMap.size === 0) {
            this.endCall(CallEndReason.REASON_AllLeft);
        }
    }

    endCall(reason) {
        if (this.status === CallState.STATUS_IDLE) {
            return;
        }

        this.setState(CallState.STATUS_IDLE);

        if (reason !== CallEndReason.REASON_AcceptByOtherClient) {
            let byeMessage = new CallByeMessageContent();
            byeMessage.callId = this.callId;
            avenginekit.sendSignalMessage(byeMessage, this.getParticipantIds(), false);
        }

        this.endTime = (new Date()).valueOf();
        this.endMedia();

        avenginekit.currentSession = null;
    }
}
