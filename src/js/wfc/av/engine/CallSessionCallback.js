export default class CallSessionCallback {

    onInitial(session, selfUserInfo, participantUserInfos) {

    }

    didCallEndWithReason(reason) {

    }

    didChangeState(state) {

    }

    didParticipantJoined(userId, userInfo) {

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
