import { isElectron } from './platform'
export default class Config {
    // 是否支持多人音视频通话
    static ENABLE_MULTI_VOIP_CALL = true;
    // 是否支持1对1音视频通话
    static ENABLE_SINGLE_VOIP_CALL = true;
    // 打开voip调试模式时，voip window不会自动关闭，方便分析控制台日志，需要手动关闭。
    static ENABLE_VOIP_DEBUG_MODE = false;

    static DEFAULT_PORTRAIT_URL = 'https://static.wildfirechat.cn/user-fallback.png';
    static APP_SERVER = 'http://wildfirechat.cn:8888';
    static QR_CODE_PREFIX_PC_SESSION = "wildfirechat://pcsession/";
    static ICE_ADDRESS = 'turn:turn.wildfirechat.cn:3478';
    static ICE_USERNAME = 'wfchat';
    static ICE_PASSWORD = 'wfchat';
    static LANGUAGE = 'zh_CN';

    static getWFCPlatform() {
        if (isElectron()) {
            if (window.process && window.process.platform === 'darwin') {
                // osx
                return 4;
            } else {
                // windows
                return 3;
            }

        } else {
            // web
            return 5;
        }
    }
}
