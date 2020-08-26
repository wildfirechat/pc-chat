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

@inject(stores => ({
    avatar: stores.sessions.avatar,
    code: stores.sessions.code,
}))
@observer
export default class Login extends Component {
    @observable qrCode;
    @observable desc = '扫码登录野火IM'
    appToken = '';
    loginTimer;
    qrCodeTimer;
    lastAppToken;

    componentDidMount() {
        axios.defaults.baseURL = Config.APP_SERVER;

        let userId = localStorage.getItem("userId");
        this.createPCLoginSession(userId);
        if (!userId) {
            // 此前尚未登录过，需要手机端扫码登录
            this.refreshQrCode();
        } else {
            // 此前已登录过，直接点登录，请求手机端确认登录
            // TODO 渲染头像 按钮等
        }
        // TODO 渲染切换账号，并且点击切换账号的时候，localStorage.setItem('userId', '')
    }

    componentWillUnmount() {
        console.log('login will disappear');
        clearInterval(this.loginTimer);
        clearInterval(this.qrCodeTimer);
    }

    renderUser() {
        return (
            <div className={classes.inner}>
                {
                    <img
                        className="disabledDrag"
                        src={this.props.avatar}/>
                }

                <p>Scan successful</p>
                <p>Confirm login on mobile WildfireChat</p>
            </div>
        );
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
            if (!userId) {
                this.qrCode = jrQRCode.getQrBase64(Config.QR_CODE_PREFIX_PC_SESSION + session.token);
                this.desc = '扫码登录野火IM'
            } else {
                // TODO 渲染请求已发送
            }
            this.login();
        }
    }

    // async keepLogin() {
    //     this.loginTimer = setInterval(() => {
    //         this.login();
    //     }, 1 * 1000);
    // }

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
                    // TODO store portrait etc
                    break;
                case 9:
                    console.log('qrcode scaned', response.data);
                    this.desc = response.data.result.userName + ' 已扫码，等待确认';
                    this.qrCode = response.data.result.portrait;
                    // update login status ui
                    this.login();
                    break;
                default:
                    this.lastAppToken = '';
                    console.log(response.data);
                    break
            }

        }
    }

    renderCode() {

        return (
            <div className={classes.inner}>
                {
                    this.qrCode && (<img className="disabledDrag" src={this.qrCode}/>)
                }

                <a href={window.location.pathname + '?' + +new Date()}>刷新二维码</a>

                <p>{this.desc}</p>
            </div>
        );
    }

    render() {
        return (
            <div className={classes.container}>
                {
                    // this.props.avatar ? this.renderUser() : this.renderCode()
                    this.renderCode()
                }
            </div>
        );
    }
}
