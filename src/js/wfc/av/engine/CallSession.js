import Config from '../../../config.js';

// 运行在新的voip window
export default class CallSession {
    static iceServers = [{
        urls: [Config.ICE_ADDRESS],
        username: Config.ICE_USERNAME,
        credential: Config.ICE_PASSWORD
    }];
    videoMuted = false;
    audioOnly = false;
    muted = false;

    startTime;

    playIncomingRing() {
        // TODO
        //在界面初始化时播放来电铃声
    }

    stopIncomingRing() {
        // TODO
        //再接听/语音接听/结束媒体时停止播放来电铃声，可能有多次，需要避免出问题
    }

    // PC/Web端邀请成的会话对象时调用
    inviteNewParticipants(newParticipantIds) {
    }

    call() {
    }

    hangup() {
    }

    triggerMicrophone() {
    }

    // 回落到语音
    downgrade2Voice() {
    }

    setVideoEnabled(enable){

    }

}
