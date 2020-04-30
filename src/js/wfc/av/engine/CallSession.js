import Config from '../../../config.js'

// 运行在新的voip window
export default class CallSession {
    static iceServers = [
        {
            urls: [Config.ICE_ADDRESS],
            username: Config.ICE_USERNAME,
            credential: Config.ICE_PASSWORD,
        }]
    videoMuted = false
    audioOnly = false
    muted = false

    startTime
    startMsgUid

    /**
     * 播放来电响铃
     */
    playIncomingRing () {
        // TODO
        //在界面初始化时播放来电铃声
    }

    /**
     * 停止响铃
     */
    stopIncomingRing () {
        // TODO
        //再接听/语音接听/结束媒体时停止播放来电铃声，可能有多次，需要避免出问题
    }

    /**
     * 多人音视频通话中，邀请新成员
     * @param newParticipantIds
     */
    inviteNewParticipants (newParticipantIds) {
    }

    /**
     * 接听来电
     */
    call () {
    }

    /**
     * 挂断
     */
    hangup () {
    }

    /**
     * 打开或者关闭麦克风
     */
    triggerMicrophone () {
    }

    // 回落到语音
    downgrade2Voice () {
    }

    /**
     * 打开或关闭摄像头
     * @param enable
     */
    setVideoEnabled (enable) {

    }

    /**
     * 开始屏幕共享
     */
    startScreenShare() {

    }

    isScreenSharing(){

    }

    stopScreenShare(){

    }
}
