import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';

import classes from './style.css';
import Config from '../../../config';
import jrQRCode from 'jr-qrcode'
import wfc from '../../../wfc/client/wfc'
import PCSession from '../../../wfc/model/pcsession';
import {observable} from 'mobx';
import axios from 'axios';
import {connect} from '../../../platform'
import ConnectionStatus from "../../../wfc/client/connectionStatus";
import EventType from "../../../wfc/client/wfcEvent";

@observer
export default class Login extends Component {
    @observable qrCode;
    @observable desc = '扫码登录野火IM'
    @observable scanToLogin = true;
    @observable hasSentLoginRequest = false;
    appToken = '';
    loginTimer;
    qrCodeTimer;
    lastAppToken;
    loginButton;

    componentDidMount() {
        this.loginButton = this.refs.loginButton;
        axios.defaults.baseURL = Config.APP_SERVER;

        let userId = localStorage.getItem("userId");
        if (!userId) {
            // 此前尚未登录过，需要手机端扫码登录
            this.createPCLoginSession(null);
            this.refreshQrCode();
        } else {
            // 此前已登录过，显示此前登录的账号信息
            this.scanToLogin = false;
            this.qrCode = localStorage.getItem("userPortrait")
            this.desc = localStorage.getItem("userName");
        }
        wfc.eventEmitter.on(EventType.ConnectionStatusChanged, this.onConnectionStatusChange)
    }

    componentWillUnmount() {
        console.log('login will disappear');
        clearInterval(this.loginTimer);
        clearInterval(this.qrCodeTimer);
        wfc.eventEmitter.removeListener(EventType.ConnectionStatusChanged, this.onConnectionStatusChange)
    }

    async createPCLoginSession(userId) {
        let response = await axios.post('/pc_session', {
            userId: userId,
            device_name: 'pc',
            clientId: wfc.getClientId(),
            platform: Config.getWFCPlatform()
        });
        console.log('----------- createPCLoginSession', response.data);
        if (response.data) {
            let session = Object.assign(new PCSession(), response.data.result);
            this.appToken = session.token;
            if (!userId || session.status === 0/*服务端pc login session不存在*/) {
                this.qrCode = jrQRCode.getQrBase64(Config.QR_CODE_PREFIX_PC_SESSION + session.token);
                this.desc = '扫码登录野火IM'
                this.scanToLogin = true;

                if (userId) {
                    this.refreshQrCode();
                }
            }

            this.login();
        }
    }

    async refreshQrCode() {
        this.qrCodeTimer = setInterval(() => {
            this.appToken = '';
            this.getCode();
        }, 30 * 1000);
    }

    async login() {
        if (this.appToken === '' || this.lastAppToken === this.appToken) {
            console.log('-------- token is empty or invalid');
            return;
        }
        var response = await axios.post('/session_login/' + this.appToken);
        console.log('---------- login', response.data);
        if (response.data) {
            switch (response.data.code) {
                case 0:
                    this.lastAppToken = this.appToken;
                    let userId = response.data.result.userId;
                    let imToken = response.data.result.token;
                    connect(userId, imToken);
                    WildFireIM.config.loginUser = wfc.getUserInfo(wfc.getUserId());
                    WildFireIM.config.token = this.appToken;

                    localStorage.setItem('userId', userId);
                    break;
                case 9:
                    console.log('qrcode scaned', response.data);
                    this.desc = response.data.result.userName + ' 已扫码，等待确认';
                    this.qrCode = response.data.result.portrait;
                    // update login status ui
                    localStorage.setItem("userName", response.data.result.userName);
                    localStorage.setItem("userPortrait", response.data.result.portrait)
                    this.login();
                    break;
                default:
                    this.lastAppToken = '';
                    console.log(response.data);
                    break
            }

        }
    }

    onConnectionStatusChange = (status) => {
        if (status === ConnectionStatus.ConnectionStatusLogout
            || status === ConnectionStatus.ConnectionStatusRejected
            || status === ConnectionStatus.ConnectionStatusSecretKeyMismatch
            || status === ConnectionStatus.ConnectionStatusTokenIncorrect) {
            localStorage.setItem("userId", '')
        }
    }

    sendLoginRequest = () => {
        let userId = localStorage.getItem("userId");
        this.createPCLoginSession(userId);
        this.hasSentLoginRequest = true;
    }

    switchUser = () => {
        localStorage.setItem("userId", "");
        localStorage.setItem("userName", "");
        localStorage.setItem("userPortrait", "");

        this.scanToLogin = true;
        this.hasSentLoginRequest = false;
        this.createPCLoginSession(null);
        this.refreshQrCode();
    }

    render() {
        return (
            <div className={classes.container}>
                {
                    this.scanToLogin ? (
                        <div className={classes.inner}>
                            {
                                this.qrCode && (<img className="disabledDrag" src={this.qrCode}/>)
                            }

                            <a href={window.location.pathname + '?' + +new Date()}>刷新二维码</a>

                            <p>{this.desc}</p>
                        </div>

                    ) : (this.hasSentLoginRequest ? (
                        <div className={classes.inner}>
                            {
                                <img className="disabledDrag" src={this.qrCode}/>
                            }
                            <p>请在手机上点击确认以登录</p>

                            <button onClick={this.switchUser}> 取消登录</button>
                        </div>

                    ) : (
                        <div className={classes.inner}>
                            {
                                <img className="disabledDrag" src={this.qrCode}/>
                            }

                            <button onClick={this.sendLoginRequest}> 登录</button>
                            <button onClick={this.switchUser}>切换用户</button>
                        </div>
                    ))
                }
            </div>
        );
    }
}
