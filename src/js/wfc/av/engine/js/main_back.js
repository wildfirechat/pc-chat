import engineAdaper from './engineAdaper_electron';

engineAdaper.init();
engineAdaper.setInitCallUI(function(message) {
    if (message.moCall) {
        callButton.disabled = false;
        hangupButton.disabled = false;
        toVoiceButton.hidden = true;
        starPreview(false, message.voiceOnly);
    } else {
        callButton.disabled = false;
        hangupButton.disabled = false;
        if (!message.audioOnly) {
            toVoiceButton.hidden = false;
            toVoiceButton.disabled = false;
        }
    }
});
engineAdaper.setStartMedia(function(message) {
  startMedia(message.isInitiator, message.audioOnly);
});

engineAdaper.setSetRemoteOffer(function(message) {
  onReceiveRemoteCreateOffer(message);
});

engineAdaper.setSetRemoteAnswer(function(message) {
  onReceiveRemoteAnswerOffer(message);
});

engineAdaper.setSetRemoteIceCandidate(function(message) {
  console.log('setRemoteIceCandidate');
  console.log(message);
  if (!pcSetuped) {
      console.log('pc not setup yet pool it');
      pooledSignalingMsg.push(message);
  } else {
      console.log('handle the candidiated');
      onReceiveRemoteIceCandidate(JSON.parse(message));
  }
});

engineAdaper.setEndMedia(function() {
  endMedia();
})

engineAdaper.setDowngrade2Voice(function() {
  downgrade2Voice();
})


async function starPreview(continueStartMedia, audioOnly) {
    console.log('start preview');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: !audioOnly });
        console.log('Received local stream');
        localVideo.srcObject = stream;
        localStream = stream;

        if (continueStartMedia) {
            startMedia(isInitiator, audioOnly);
        }
    } catch (e) {
        alert(`getUserMedia() error: ${e.name}`);
    }
    callButton.disabled = true;
}

var isInitiator;
var pcSetuped;
var pooledSignalingMsg = [];

async function startMedia(initiator, audioOnly) {
    console.log('start media', initiator);
    isInitiator = initiator;
    startTime = window.performance.now();
    if (!localStream) {
        starPreview(true, audioOnly);
        return;
    } else {
        console.log('start pc');
    }

    const videoTracks = localStream.getVideoTracks();
    if (!audioOnly) {
        if (videoTracks && videoTracks.length > 0) {
            console.log(`Using video device: ${videoTracks[0].label}`);
        }
    } else {
        if (videoTracks && videoTracks.length > 0) {
            videoTracks.forEach(track => track.stop());
        }
    }

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length > 0) {
        console.log(`Using audio device: ${audioTracks[0].label}`);
    }
    var configuration = getSelectedSdpSemantics();
    var iceServer = {
        urls: ['turn:turn.wildfirechat.cn:3478'],
        username: 'wfchat',
        credential: 'wfchat'
    };
    var iceServers = [];
    iceServers.push(iceServer);
    configuration.iceServers = iceServers;
    console.log('RTCPeerConnection configuration:', configuration);

    pc1 = new RTCPeerConnection(configuration);
    console.log('Created local peer connection object pc1');
    pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e));

    pc1.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc1, e));
    pc1.addEventListener('track', gotRemoteStream);

    if (!audioOnly) {
        localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
    } else {
        localStream.getAudioTracks().forEach(track => pc1.addTrack(track, localStream));
    }
    console.log('Added local stream to pc1');

    if (isInitiator) {
        try {
            console.log('pc1 createOffer start');
            const offer = await pc1.createOffer(offerOptions);
            await onCreateOfferSuccess(offer);
        } catch (e) {
            onCreateSessionDescriptionError(e);
        }
    }

    callButton.disabled = true;
    remoteVideo.hidden = false;
    remoteVideo.setAttribute('style', 'width:200px; z-index:100px; position:absolute; right:20px; float:right;');
    if (audioOnly) {
        localVideo.hidden = true;
        remoteVideo.hidden = true;
    }
}

function downgrade2Voice() {
    localVideo.hidden = true;
    remoteVideo.hidden = true;

    const localVideoTracks = localStream.getVideoTracks();
    if (localVideoTracks && localVideoTracks.length > 0) {
        localVideoTracks.forEach(track => track.stop());
    }

    localVideo.srcObject = null;
    remoteVideo.srcObject = null;

    toVoiceButton.hidden = true;
}

const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');
const toVoiceButton = document.getElementById('toVoiceButton');
callButton.disabled = false;
hangupButton.disabled = false;
callButton.addEventListener('click', call);
hangupButton.addEventListener('click', hangup);
toVoiceButton.addEventListener('click', downToVoice);

let startTime;
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

localVideo.addEventListener('loadedmetadata', function() {
    console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('loadedmetadata', function() {
    console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
});

remoteVideo.addEventListener('resize', () => {
    console.log(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`);
    // We'll use the first onsize callback as an indication that video has started
    // playing out.
    if (startTime) {
        const elapsedTime = window.performance.now() - startTime;
        console.log('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
        startTime = null;
    }
});

var localStream;
var pc1;
const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};

function getName(pc) {
    return 'pc1';
}

function getSelectedSdpSemantics() {
    // const sdpSemanticsSelect = document.querySelector('#sdpSemantics');
    // const option = sdpSemanticsSelect.options[sdpSemanticsSelect.selectedIndex];
    // return option.value === '' ? {} : { sdpSemantics: option.value };
    return {};
}

async function call() {
    callButton.hidden = true;
    hangupButton.disabled = false;
    console.log('on call button call');
    engineAdaper.onCallButton();
    // ipcRenderer.send('onCallButton');
}

function onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
}

function drainOutSingnalingMessage() {
    console.log('drain pooled msg');
    console.log(pooledSignalingMsg.length);
    pooledSignalingMsg.forEach((message) => {
        console.log('popup pooled message');
        console.log(message);
        onReceiveRemoteIceCandidate(JSON.parse(message));
    });
}

async function onReceiveRemoteCreateOffer(desc) {
    console.log('pc1 setRemoteDescription start');
    try {
        await pc1.setRemoteDescription(desc);
        onSetRemoteSuccess(pc1);
    } catch (e) {
        onSetSessionDescriptionError(e);
    }

    console.log('pc1 createAnswer start');
    // Since the 'remote' side has no media stream we need
    // to pass in the right constraints in order for it to
    // accept the incoming offer of audio and video.
    try {
        const answer = await pc1.createAnswer();
        await onCreateAnswerSuccess(answer);
    } catch (e) {
        onCreateSessionDescriptionError(e);
    }
}

async function onCreateOfferSuccess(desc) {
    console.log(`Offer from pc1\n${desc.sdp}`);
    console.log('pc1 setLocalDescription start');
    try {
        await pc1.setLocalDescription(desc);
        onSetLocalSuccess(pc1);
        pcSetuped = true;
        drainOutSingnalingMessage();
    } catch (e) {
        onSetSessionDescriptionError();
    }

    console.log(desc);
    engineAdaper.onCreateAnswerOffer(desc);
    // ipcRenderer.send('onCreateAnswerOffer', JSON.stringify(desc));
}

function onSetLocalSuccess(pc) {
    console.log(`${getName(pc)} setLocalDescription complete`);
}

function onSetRemoteSuccess(pc) {
    console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
    console.log(`Failed to set session description: ${error.toString()}`);
}

function gotRemoteStream(e) {
    if (remoteVideo.srcObject !== e.streams[0]) {
        remoteVideo.srcObject = e.streams[0];
        console.log('pc1 received remote stream');
    }
}

async function onReceiveRemoteAnswerOffer(desc) {
    console.log('pc1 setRemoteDescription start');
    try {
        await pc1.setRemoteDescription(desc);
        onSetRemoteSuccess(pc1);
    } catch (e) {
        onSetSessionDescriptionError(e);
    }
}

async function onCreateAnswerSuccess(desc) {
    console.log(`Answer from pc1:\n${desc.sdp}`);
    console.log('pc1 setLocalDescription start');
    try {
        await pc1.setLocalDescription(desc);
        onSetLocalSuccess(pc1);
        pcSetuped = true;
        drainOutSingnalingMessage();
    } catch (e) {
        onSetSessionDescriptionError(e);
    }
    console.log(desc);
    engineAdaper.onCreateAnswerOffer(desc);
    // ipcRenderer.send('onCreateAnswerOffer', JSON.stringify(desc));
}

async function onReceiveRemoteIceCandidate(message) {
    console.log('on receive remote ice candidate');
    await pc1.addIceCandidate(message);
}

async function onIceCandidate(pc, event) {
    if (!event.candidate) {
        return;
    }
    try {
        engineAdaper.onIceCandidate(event.candidate);
        // ipcRenderer.send('onIceCandidate', JSON.stringify(event.candidate));
        onAddIceCandidateSuccess(pc);
    } catch (e) {
        onAddIceCandidateError(pc, e);
    }
    console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess(pc) {
    console.log(`${getName(pc)} send Ice Candidate success`);
}

function onAddIceCandidateError(pc, error) {
    console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

function onIceStateChange(pc, event) {
    if (pc) {
        console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
        console.log('ICE state change event: ', event);
    }
}

function hangup() {
    console.log('Ending call');
    callButton.hidden = true;
    hangupButton.hidden = true;
    engineAdaper.onHangupButton();
    endMedia();
}

function downToVoice() {
    console.log('down to voice');
    toVoiceButton.disabled = true;
    toVoiceButton.hidden = true;
    engineAdaper.downToVoice();
    // ipcRenderer.send('downToVoice');
}

function endMedia() {
    console.log('Ending media');

    if (localStream) {
        if (typeof localStream.getTracks === 'undefined') {
            // Support legacy browsers, like phantomJs we use to run tests.
            localStream.stop();
        } else {
            localStream.getTracks().forEach(function(track) {
                track.stop();
            });
        }
        localStream = null;
    }

    if (pc1) {
        pc1.close();
        pc1 = null;
    }

    engineAdaper.destory();

    // 停几秒，显示通话时间，再结束
    // 页面释放有问题没有真正释放掉
    // eslint-disable-next-line no-const-assign
    setTimeout(function() { if (currentWindow) { currentWindow.close(); currentWindow = null; } }, 2000);
}
