export default class PeerConnectionClient {
    isInitiator;
    userId;
    status;
    joinTime = 0;
    acceptTime = 0;
    videoMuted;

    peerConnection;

    callSession;

    constructor(userId, callSession) {
        this.userId = userId;
        this.callSession = callSession;
    }

}
