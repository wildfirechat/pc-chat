import {ipcRenderer, isElectron, currentWindow, PostMessageEventEmitter} from '../../../platform'
import Config from '../../../config.js';
import CallState from "./callState";
import avenginekit from '../avenginekit'

// 运行在新的voip window
export class RemoteCallSession {

    status = 0;
    audioOnly = false;
    muted = false;

    targetUserInfo;
    targetUserDisplayName;

    moCall; // true, outgoing; false, incoming
    isInitiator;
    pcSetuped;
    queuedOffer;
    pooledSignalingMsg = [];
    startTime;
    localStream;
    remoteStream;
    pc;
    callTimer;

    sessionCallback;

    setState(status) {
        this.status = status;
        console.log('set status', status);
        if (this.sessionCallback) {
            this.sessionCallback.didChangeState(status);
        }
    }

    setAudioOnly(audioOnly) {
        this.audioOnly = audioOnly;
        if (this.audioOnly) {
            this.sessionCallback.didChangeMode(audioOnly);
        }
    }

    drainOfferMessage() {
        if (!this.queuedOffer) {
            return false;
        }

        this.onReceiveRemoteCreateOffer(this.queuedOffer);
        this.queuedOffer = null;
    }

    queueOfferMessage(desc) {
        this.queuedOffer = desc;
    }

    playIncomingRing() {
        //在界面初始化时播放来电铃声
    }

    stopIncomingRing() {
        //再接听/语音接听/结束媒体时停止播放来电铃声，可能有多次，需要避免出问题
    }

    initCallUI(moCall, audioOnly, targetUserInfo) {
        this.moCall = moCall;
        this.setAudioOnly(audioOnly);
        this.targetUserInfo = targetUserInfo;
        this.targetUserDisplayName = targetUserInfo.displayName;

        if (moCall) {
            this.setState(CallState.STATUS_OUTGOING);
            this.startPreview(false, audioOnly);
        } else {
            this.setState(CallState.STATUS_INCOMING);
            this.playIncomingRing();
        }
    }

    async startPreview(continueStartMedia, audioOnly) {
        console.log('start preview');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: !audioOnly});
            console.log('Received local stream', stream);
            if (this.sessionCallback) {
                this.sessionCallback.didCreateLocalVideoTrack(stream);
            }
            // this.localVideo.srcObject = stream;
            this.localStream = stream;

            if (continueStartMedia) {
                this.startMedia(this.isInitiator, audioOnly);
            }
        } catch (e) {
            console.log('getUserMedia error', e);
            alert(`getUserMedia() error: ${e.name}`);
            this.endCall();
        }
    }


    async startMedia(initiator, audioOnly) {
        console.log('start media', initiator);
        this.isInitiator = initiator;
        this.setState(CallState.STATUS_CONNECTING);
        this.startTime = window.performance.now();
        if (!this.localStream) {
            this.startPreview(true, audioOnly);
            return;
        } else {
            console.log('start pc');
        }

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
        var configuration = this.getSelectedSdpSemantics();
        var iceServer = {
            urls: [Config.ICE_ADDRESS],
            username: Config.ICE_USERNAME,
            credential: Config.ICE_PASSWORD
        };
        var iceServers = [];
        iceServers.push(iceServer);
        configuration.iceServers = iceServers;
        console.log('RTCPeerConnection configuration:', configuration);

        this.pc = new RTCPeerConnection(configuration);
        console.log('Created local peer connection object pc');
        this.pc.addEventListener('icecandidate', e => this.onIceCandidate(this.pc, e));

        this.pc.addEventListener('iceconnectionstatechange', e => this.onIceStateChange(this.pc, e));
        this.pc.addEventListener('track', this.gotRemoteStream);

        if (!audioOnly) {
            this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream));
        } else {
            this.localStream.getAudioTracks().forEach(track => this.pc.addTrack(track, this.localStream));
        }
        console.log('Added local stream to pc');

        if (this.isInitiator) {
            try {
                console.log('pc createOffer start');
                var offerOptions = {
                    offerToReceiveAudio: 1,
                    offerToReceiveVideo: !audioOnly
                };
                const offer = await this.pc.createOffer(offerOptions);
                var mutableOffer = JSON.parse(JSON.stringify(offer));
                mutableOffer.type = 'offer';
                await this.onCreateOfferSuccess(offer);
            } catch (e) {
                this.onCreateSessionDescriptionError(e);
            }
        }

        this.drainOfferMessage();
    }

    downgrade2Voice() {
        if (this.status !== CallState.STATUS_CONNECTED) {
            return
        }
        this.setAudioOnly(true);

        const localVideoTracks = this.localStream.getVideoTracks();
        if (localVideoTracks && localVideoTracks.length > 0) {
            localVideoTracks.forEach(track => track.stop());
        }

        // this.localVideo.srcObject = null;
        // this.remoteVideo.srcObject = null;

        // this.voipEventEmit('downToVoice');
        avenginekit.downToVoice();
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

        this.setState(CallState.STATUS_CONNECTING);
        console.log('on call button call');
        avenginekit.answerCall();
    }

    onCreateSessionDescriptionError(error) {
        console.log('Failed to create session description');
        // console.log(`Failed to create session description: ${error.toString()}`);
        this.endCall();
    }

    drainOutSignalingMessage() {
        console.log('drain pooled msg');
        console.log(this.pooledSignalingMsg.length);
        this.pooledSignalingMsg.forEach((message) => {
            console.log('popup pooled message');
            console.log(message);
            this.onReceiveRemoteIceCandidate(message);
        });
    }

    async onReceiveRemoteCreateOffer(desc) {
        console.log('pc setRemoteDescription start');
        if (this.status !== CallState.STATUS_CONNECTING && this.status !== CallState.STATUS_CONNECTED) {
            this.queueOfferMessage(desc);
            return;
        }
        try {
            await this.pc.setRemoteDescription(desc);
            this.onSetRemoteSuccess(this.pc);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }

        console.log('pc createAnswer start');
        // Since the 'remote' side has no media stream we need
        // to pass in the right constraints in order for it to
        // accept the incoming offer of audio and video.
        try {
            const answer = await this.pc.createAnswer();
            var mutableAnswer = JSON.parse(JSON.stringify(answer));
            mutableAnswer.type = 'answer';
            await this.onCreateAnswerSuccess(answer);
        } catch (e) {
            this.onCreateSessionDescriptionError(e);
        }
    }

    async onCreateOfferSuccess(desc) {
        console.log(`Offer from pc\n${desc.sdp}`);
        console.log('pc setLocalDescription start');
        try {
            await this.pc.setLocalDescription(desc);
            this.onSetLocalSuccess(this.pc);
            this.pcSetuped = true;
            this.drainOutSignalingMessage();
        } catch (e) {
            this.onSetSessionDescriptionError();
        }

        console.log(desc);
        // this.voipEventEmit('onCreateAnswerOffer', JSON.stringify(desc));
        avenginekit.onCreateAnswerOffer(desc);
    }

    onSetLocalSuccess(pc) {
        console.log(`setLocalDescription complete`);
    }

    onSetRemoteSuccess(pc) {
        console.log(`setRemoteDescription complete`);
    }

    onSetSessionDescriptionError(error) {
        console.log(`Failed to set session description: ${error.toString()}`);
        this.endCall();
    }

    gotRemoteStream = (e) => {
        if (this.remoteStream !== e.streams[0]) {
            if (this.sessionCallback) {
                this.sessionCallback.didReceiveRemoteVideoTrack(this.targetUserInfo.uid, e.streams[0]);
            }
            // this.remoteVideo.srcObject = e.streams[0];
            console.log('pc received remote stream', e.streams[0]);
        }
    };

    async onReceiveRemoteAnswerOffer(desc) {
        console.log('pc setRemoteDescription start');
        try {
            await this.pc.setRemoteDescription(desc);
            this.onSetRemoteSuccess(this.pc);
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }
    }

    async setRemoteIceCandidate(message) {
        console.log("xxxxxxxxxx", message);
        if (!this.pcSetuped) {
            console.log('pc not setup yet pool it');
            this.pooledSignalingMsg.push(message);
        } else {
            console.log('handle the candidiated');
            this.onReceiveRemoteIceCandidate(message);
        }
    }

    async onCreateAnswerSuccess(desc) {
        console.log(`Answer from pc:\n${desc.sdp}`);
        console.log('pc setLocalDescription start');
        try {
            await this.pc.setLocalDescription(desc);
            this.onSetLocalSuccess(this.pc);
            this.pcSetuped = true;
            this.drainOutSignalingMessage();
        } catch (e) {
            this.onSetSessionDescriptionError(e);
        }
        console.log(desc);
        // this.voipEventEmit('onCreateAnswerOffer', JSON.stringify(desc));
        avenginekit.onCreateAnswerOffer(desc);
    }

    async onReceiveRemoteIceCandidate(message) {
        console.log('on receive remote ice candidate');
        await this.pc.addIceCandidate(message);
    }

    onIceCandidate = (pc, event) => {
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
            //this.voipEventEmit('onIceCandidate', JSON.stringify(candidate));
            avenginekit.onIceCandidate(candidate);
            this.onAddIceCandidateSuccess(pc);
        } catch (e) {
            this.onAddIceCandidateError(pc, e);
        }
        console.log(`ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
    };

    onAddIceCandidateSuccess(pc) {
        console.log(`send Ice Candidate success`);
    }

    onAddIceCandidateError(pc, error) {
        console.log(`failed to add ICE Candidate: ${error.toString()}`);
        this.endCall();
    }


    onIceStateChange = (pc, event) => {
        if (pc) {
            console.log(`ICE state: ${pc.iceConnectionState}`, pc);
            console.log('ICE state change event: ', event);
            if (pc.iceConnectionState === 'connected') {
                this.setState(CallState.STATUS_CONNECTED);
            }
            // this.voipEventEmit('onIceStateChange', pc.iceConnectionState);
            avenginekit.onIceStateChange(pc.iceConnectionState);
        }
    };

    hangup() {
        console.log('Ending call');
        avenginekit.hangup();
        this.endCall();
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

    downToVoice() {
        console.log('down to voice');
        this.stopIncomingRing();
        // this.voipEventEmit('downToVoice');
        avenginekit.downToVoice();
    }

    endCall() {
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

        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }

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
}

const self = new RemoteCallSession();
export default self;
