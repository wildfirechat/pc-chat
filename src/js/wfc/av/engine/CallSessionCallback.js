/*
 * Copyright (c) 2020 WildFireChat. All rights reserved.
 */

export default class CallSessionCallback {

    /**
     * session 初始化回调
     * @param {CallSession} session 会话信息
     * @param {UserInfo} selfUserInfo 自己的用户信息
     * @param {[UserInfo]} participantUserInfos
     * @param {[UserInfo]} groupMemberUserInfos 多人音视频通话是有效。 发起音视频通话所在群的群成员信息。
     */
    onInitial(session, selfUserInfo, participantUserInfos, groupMemberUserInfos) {

    }

    didCallEndWithReason(reason) {

    }

    didChangeState(state) {

    }

    didParticipantJoined(userId, userInfo) {

    }

    didParticipantConnected(userId) {

    }

    didParticipantLeft(userId, callEndReason) {

    }

    didChangeMode(audioOnly) {

    }

    didCreateLocalVideoTrack(stream) {

    }

    didError(error) {

    }

    didGetStats(reports) {

    }

    didReceiveRemoteVideoTrack(userId, stream) {

    }

    didRemoveRemoteVideoTrack(userId) {

    }

    didReportAudioVolume(userId, volume){

    }

    didVideoMuted(userId, muted) {

    }
}
