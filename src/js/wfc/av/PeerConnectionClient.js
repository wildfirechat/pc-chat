export default class PeerConnectionClient {
    isInitiator;
    userId;
    status;
    joinTime;
    acceptTime;
    videoMuted;

    peerConnection;

    callSession;

    constructor(userId, callSession) {
        this.userId = userId;
        this.callSession = callSession;
    }

}
