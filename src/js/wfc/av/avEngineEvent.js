export default class AVEngineEvent {
    static kDidReceiveCall = 'kDidReceiveCall';
    static kShouldStartRing = 'kShouldStartRing';
    static kShouldStopRing = 'kShouldStopRing';
    static kDidChangeState = 'kDidChangeState';
    static kDidCallEndWithReason = 'kDidCallEndWithReason';

    static kDidError = 'kDidError';
    static kDidChangeMode = 'kDidChangeMode';
    static kDidCreateLocalVideoTrack = 'kDidCreateLocalVideoTrack';
    static kDidReceiveRemoteVideoTrack = 'kDidReceiveRemoteVideoTrack';
}
