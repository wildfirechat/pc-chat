// /*
//  *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
//  *
//  *  Use of this source code is governed by a BSD-style license
//  *  that can be found in the LICENSE file in the root of the source
//  *  tree.
//  */

// 'use strict';
// const currentWindow = require('electron').remote.getCurrentWindow();
// var ipcRenderer = require('electron').ipcRenderer;

// var moCall;

// function playIncommingRing() {
//     //在界面初始化时播放来电铃声
// }

// function stopIncommingRing() {
//     //再接听/语音接听/结束媒体时停止播放来电铃声，可能有多次，需要避免出问题
// }

// ipcRenderer.on('initCallUI', function (event, message) { // 监听父页面定义的端口
//     moCall = message.moCall;
//     if (message.moCall) {
//         callButton.disabled = false;
//         hangupButton.disabled = false;
//         toVoiceButton.hidden = true;
//         switchMicorphone.hidden = true;
//         if (message.audioOnly) {
//             localVideo.hidden = true;
//             remoteVideo.hidden = true;
//         } else {
//             toVoiceButton.hidden = false;
//             toVoiceButton.disabled = false;
//         }
//         starPreview(false, message.voiceOnly);
//     } else {
//         playIncommingRing();

//         callButton.disabled = false;
//         hangupButton.disabled = false;
//         if (message.audioOnly) {
//             localVideo.hidden = true;
//             remoteVideo.hidden = true;
//             toVoiceButton.hidden = true;
//         } else {
//             toVoiceButton.hidden = false;
//             toVoiceButton.disabled = false;
//         }
//         switchMicorphone.hidden = true;
//     }
// });

// ipcRenderer.on('startMedia', function (event, message) { // 监听父页面定义的端口
//     startMedia(message.isInitiator, message.audioOnly);
// });

// ipcRenderer.on('setRemoteOffer', (event, message) => {
//     onReceiveRemoteCreateOffer(JSON.parse(message));
// });

// ipcRenderer.on('setRemoteAnswer', (event, message) => {
//     onReceiveRemoteAnswerOffer(JSON.parse(message));
// });

// ipcRenderer.on('setRemoteIceCandidate', (event, message) => {
//     console.log('setRemoteIceCandidate');
//     console.log(message);
//     if (!pcSetuped) {
//         console.log('pc not setup yet pool it');
//         pooledSignalingMsg.push(message);
//     } else {
//         console.log('handle the candidiated');
//         onReceiveRemoteIceCandidate(JSON.parse(message));
//     }
// });

// ipcRenderer.on('endCall', function () { // 监听父页面定义的端口
//     endCall();
// });

// ipcRenderer.on('downgrade2Voice', function () {
//     downgrade2Voice();
// });

// ipcRenderer.on('ping', function () {
//     console.log('receive ping');
//     ipcRenderer.send('pong');
// });

// async function starPreview(continueStartMedia, audioOnly) {
//     console.log('start preview');
//     try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: !audioOnly });
//         console.log('Received local stream');
//         localVideo.srcObject = stream;
//         localStream = stream;

//         if (continueStartMedia) {
//             startMedia(isInitiator, audioOnly);
//         }
//     } catch (e) {
//         console.log('getUserMedia error', e);
//         alert(`getUserMedia() error: ${e.name}`);
//     }
//     callButton.disabled = true;
// }

// var isInitiator;
// var pcSetuped;
// var pooledSignalingMsg = [];

// async function startMedia(initiator, audioOnly) {
//     console.log('start media', initiator);
//     isInitiator = initiator;
//     startTime = window.performance.now();
//     if (!localStream) {
//         starPreview(true, audioOnly);
//         return;
//     } else {
//         console.log('start pc');
//     }

//     const videoTracks = localStream.getVideoTracks();
//     if (!audioOnly) {
//         if (videoTracks && videoTracks.length > 0) {
//             console.log(`Using video device: ${videoTracks[0].label}`);
//         }
//     } else {
//         if (videoTracks && videoTracks.length > 0) {
//             videoTracks.forEach(track => track.stop());
//         }
//     }

//     const audioTracks = localStream.getAudioTracks();
//     if (audioTracks.length > 0) {
//         console.log(`Using audio device: ${audioTracks[0].label}`);
//     }
//     var configuration = getSelectedSdpSemantics();
//     var iceServer = {
//         urls: ['turn:turn.wildfirechat.cn:3478'],
//         username: 'wfchat',
//         credential: 'wfchat'
//     };
//     var iceServers = [];
//     iceServers.push(iceServer);
//     configuration.iceServers = iceServers;
//     console.log('RTCPeerConnection configuration:', configuration);

//     pc1 = new RTCPeerConnection(configuration);
//     console.log('Created local peer connection object pc1');
//     pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e));

//     pc1.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc1, e));
//     pc1.addEventListener('track', gotRemoteStream);

//     if (!audioOnly) {
//         localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
//     } else {
//         localStream.getAudioTracks().forEach(track => pc1.addTrack(track, localStream));
//     }
//     console.log('Added local stream to pc1');

//     if (isInitiator) {
//         try {
//             console.log('pc1 createOffer start');
//             var offerOptions = {
//                 offerToReceiveAudio: 1,
//                 offerToReceiveVideo: !audioOnly
//             }
//             const offer = await pc1.createOffer(offerOptions);
//             await onCreateOfferSuccess(offer);
//         } catch (e) {
//             onCreateSessionDescriptionError(e);
//         }
//     }

//     callButton.hidden = true;
//     remoteVideo.hidden = false;
//     switchMicorphone.hidden = false;
//     if (!audioOnly) {
//         if (moCall) {
//             toVoiceButton.hidden = false;
//         }
//     }
//     remoteVideo.setAttribute('style', 'width:200px; z-index:100px; position:absolute; right:20px; float:right;');
//     if (audioOnly) {
//         localVideo.hidden = true;
//         remoteVideo.hidden = true;
//     }
// }

// function downgrade2Voice() {
//     localVideo.hidden = true;
//     remoteVideo.hidden = true;

//     const localVideoTracks = localStream.getVideoTracks();
//     if (localVideoTracks && localVideoTracks.length > 0) {
//         localVideoTracks.forEach(track => track.stop());
//     }

//     localVideo.srcObject = null;
//     remoteVideo.srcObject = null;

//     toVoiceButton.hidden = true;
// }

// const callButton = document.getElementById('callButton');
// const hangupButton = document.getElementById('hangupButton');
// const toVoiceButton = document.getElementById('toVoiceButton');
// const switchMicorphone = document.getElementById('switchMicorphone');
// callButton.disabled = false;
// hangupButton.disabled = false;
// callButton.addEventListener('click', call);
// hangupButton.addEventListener('click', hangup);
// toVoiceButton.addEventListener('click', downToVoice);
// switchMicorphone.addEventListener('click', triggerMicrophone);

// let startTime;
// const localVideo = document.getElementById('localVideo');
// const remoteVideo = document.getElementById('remoteVideo');

// localVideo.addEventListener('loadedmetadata', function () {
//     console.log(`Local video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
// });

// remoteVideo.addEventListener('loadedmetadata', function () {
//     console.log(`Remote video videoWidth: ${this.videoWidth}px,  videoHeight: ${this.videoHeight}px`);
// });

// remoteVideo.addEventListener('resize', () => {
//     console.log(`Remote video size changed to ${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`);
//     // We'll use the first onsize callback as an indication that video has started
//     // playing out.
//     if (startTime) {
//         const elapsedTime = window.performance.now() - startTime;
//         console.log('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
//     }
// });

// var localStream;
// var pc1;

// function getName(pc) {
//     return 'pc1';
// }

// function getSelectedSdpSemantics() {
//     // const sdpSemanticsSelect = document.querySelector('#sdpSemantics');
//     // const option = sdpSemanticsSelect.options[sdpSemanticsSelect.selectedIndex];
//     // return option.value === '' ? {} : { sdpSemantics: option.value };
//     return {};
// }

// async function call() {
//     stopIncommingRing();

//     callButton.hidden = true;
//     hangupButton.disabled = false;
//     console.log('on call button call');
//     ipcRenderer.send('onCallButton');
// }

// function onCreateSessionDescriptionError(error) {
//     console.log(`Failed to create session description: ${error.toString()}`);
// }

// function drainOutSingnalingMessage() {
//     console.log('drain pooled msg');
//     console.log(pooledSignalingMsg.length);
//     pooledSignalingMsg.forEach((message) => {
//         console.log('popup pooled message');
//         console.log(message);
//         onReceiveRemoteIceCandidate(JSON.parse(message));
//     });
// }

// async function onReceiveRemoteCreateOffer(desc) {
//     console.log('pc1 setRemoteDescription start');
//     try {
//         await pc1.setRemoteDescription(desc);
//         onSetRemoteSuccess(pc1);
//     } catch (e) {
//         onSetSessionDescriptionError(e);
//     }

//     console.log('pc1 createAnswer start');
//     // Since the 'remote' side has no media stream we need
//     // to pass in the right constraints in order for it to
//     // accept the incoming offer of audio and video.
//     try {
//         const answer = await pc1.createAnswer();
//         await onCreateAnswerSuccess(answer);
//     } catch (e) {
//         onCreateSessionDescriptionError(e);
//     }
// }

// async function onCreateOfferSuccess(desc) {
//     console.log(`Offer from pc1\n${desc.sdp}`);
//     console.log('pc1 setLocalDescription start');
//     try {
//         await pc1.setLocalDescription(desc);
//         onSetLocalSuccess(pc1);
//         pcSetuped = true;
//         drainOutSingnalingMessage();
//     } catch (e) {
//         onSetSessionDescriptionError();
//     }

//     console.log(desc);
//     ipcRenderer.send('onCreateAnswerOffer', JSON.stringify(desc));
// }

// function onSetLocalSuccess(pc) {
//     console.log(`${getName(pc)} setLocalDescription complete`);
// }

// function onSetRemoteSuccess(pc) {
//     console.log(`${getName(pc)} setRemoteDescription complete`);
// }

// function onSetSessionDescriptionError(error) {
//     console.log(`Failed to set session description: ${error.toString()}`);
// }

// function gotRemoteStream(e) {
//     if (remoteVideo.srcObject !== e.streams[0]) {
//         remoteVideo.srcObject = e.streams[0];
//         console.log('pc1 received remote stream');
//     }
// }

// async function onReceiveRemoteAnswerOffer(desc) {
//     console.log('pc1 setRemoteDescription start');
//     try {
//         await pc1.setRemoteDescription(desc);
//         onSetRemoteSuccess(pc1);
//     } catch (e) {
//         onSetSessionDescriptionError(e);
//     }
// }

// async function onCreateAnswerSuccess(desc) {
//     console.log(`Answer from pc1:\n${desc.sdp}`);
//     console.log('pc1 setLocalDescription start');
//     try {
//         await pc1.setLocalDescription(desc);
//         onSetLocalSuccess(pc1);
//         pcSetuped = true;
//         drainOutSingnalingMessage();
//     } catch (e) {
//         onSetSessionDescriptionError(e);
//     }
//     console.log(desc);
//     ipcRenderer.send('onCreateAnswerOffer', JSON.stringify(desc));
// }

// async function onReceiveRemoteIceCandidate(message) {
//     console.log('on receive remote ice candidate');
//     await pc1.addIceCandidate(message);
// }

// async function onIceCandidate(pc, event) {
//     if (!event.candidate) {
//         return;
//     }
//     try {
//         ipcRenderer.send('onIceCandidate', JSON.stringify(event.candidate));
//         onAddIceCandidateSuccess(pc);
//     } catch (e) {
//         onAddIceCandidateError(pc, e);
//     }
//     console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
// }

// function onAddIceCandidateSuccess(pc) {
//     console.log(`${getName(pc)} send Ice Candidate success`);
// }

// function onAddIceCandidateError(pc, error) {
//     console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
// }

// function onUpdateTime() {
//     elapsedTime = window.performance.now() - startTime;
//     console.log('Setup time: ' + elapsedTime.toFixed(3) + 'ms');
//     document.getElementById("callTime").innerHTML = elapsedTime / 1000;
// }

// var callTimer;
// function onIceStateChange(pc, event) {
//     if (pc) {
//         console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
//         console.log('ICE state change event: ', event);
//         if (pc.iceConnectionState === 'connected') {
//             //todo 界面计时开始
//             callTimer = window.setInterval(onUpdateTime, milliseconds);
//         }
//         ipcRenderer.send('onIceStateChange', pc.iceConnectionState);
//     }
// }

// function hangup() {
//     console.log('Ending call');
//     callButton.hidden = true;
//     hangupButton.hidden = true;
//     ipcRenderer.send('onHangupButton');
//     endCall();
// }

// function triggerMicrophone() {
//     console.log('trigger microphone');
//     if (localStream) {
//         const audioTracks = localStream.getAudioTracks();
//         if (audioTracks && audioTracks.length > 0) {
//             audioTracks[0].enabled = !audioTracks[0].enabled;
//         }
//     }
// }

// function downToVoice() {
//     console.log('down to voice');
//     stopIncommingRing();
//     toVoiceButton.disabled = true;
//     toVoiceButton.hidden = true;
//     callButton.hidden = true;
//     hangupButton.disabled = false;
//     ipcRenderer.send('downToVoice');
// }

// function endCall() {
//     console.log('Ending media');
//     stopIncommingRing();//可能没有接听就挂断了
//     if (callTimer) {
//         clearInterval(callTimer);
//     }


//     if (localStream) {
//         if (typeof localStream.getTracks === 'undefined') {
//             // Support legacy browsers, like phantomJs we use to run tests.
//             localStream.stop();
//         } else {
//             localStream.getTracks().forEach(function (track) {
//                 track.stop();
//             });
//         }
//         localStream = null;
//     }

//     if (pc1) {
//         pc1.close();
//         pc1 = null;
//     }

//     callButton.removeEventListener('click', call);
//     hangupButton.removeEventListener('click', hangup);
//     toVoiceButton.removeEventListener('click', downToVoice);
//     switchMicorphone.removeEventListener('click', triggerMicrophone);

//     switchMicorphone.hidden = true;

//     localVideo.hidden = true;
//     remoteVideo.hidden = true;

//     // ipcRenderer.removeListener('startPreview');
//     // ipcRenderer.removeListener('startMedia');
//     // ipcRenderer.removeListener('setRemoteOffer');
//     // ipcRenderer.removeListener('setRemoteAnswer');
//     // ipcRenderer.removeListener('setRemoteIceCandidate');
//     // ipcRenderer.removeListener('endMedia');
//     ipcRenderer.removeAllListeners(['initCallUI', 'startPreview', 'startMedia', 'setRemoteOffer', 'setRemoteAnswer', 'setRemoteIceCandidate', 'endMedia']);

//     // 停几秒，显示通话时间，再结束
//     // 页面释放有问题没有真正释放掉
//     // eslint-disable-next-line no-const-assign
//     setTimeout(function () { if (currentWindow) { currentWindow.close(); } }, 2000);
// }
