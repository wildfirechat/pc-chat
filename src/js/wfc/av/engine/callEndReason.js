export default class CallEndReason {
    static REASON_Unknown = 'unknown';
    static REASON_Busy = 'busy';
    static REASON_SignalError = 'signalError';
    static REASON_Hangup = 'hangup';
    static REASON_MediaError = 'mediaError';
    static REASON_RemoteHangup = 'remoteHangup';
    static REASON_OpenCameraFailure = 'openCameraError';
    static REASON_Timeout = 'timeout';
    static REASON_AcceptByOtherClient = 'acceptByOtherClient';
    static REASON_AllLeft = 'allLeft';
}
