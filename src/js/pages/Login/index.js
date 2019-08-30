
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import classes from './style.css';
import Config from '../../wfc/config';
import jrQRCode from 'jr-qrcode'
import wfc from '../../wfc/wfc'
import PCSession from '../../wfc/pcsession';
import { observable } from 'mobx';
import axios from 'axios';

@inject(stores => ({
    avatar: stores.sessions.avatar,
    code: stores.sessions.code,
}))
@observer
export default class Login extends Component {
    @observable qrCode;
    token;
    loginTimer;

    componentDidMount() {
        axios.defaults.baseURL = Config.APP_SERVER_HOST + ':' + Config.APP_SERVER_PORT;

        this.getCode();
        this.keepLogin();
    }

    componentWillUnmount() {
        console.log('login will disappear');
    }

    renderUser() {
        return (
            <div className={classes.inner}>
                {
                    <img
                        className="disabledDrag"
                        src={this.props.avatar} />
                }

                <p>Scan successful</p>
                <p>Confirm login on mobile WildfireChat</p>
            </div>
        );
    }

    async getCode() {
        var response = await axios.post('/pc_session', {
            token: '',
            device_name: 'my mac',
            clientId: wfc.getClientId(),
        });
        console.log('----------- getCode', response.data);
        if (response.data) {
            let session = Object.assign(new PCSession(), response.data.result);
            this.token = session.token;
            this.qrCode = jrQRCode.getQrBase64(Config.QR_CODE_PREFIX_PC_SESSION + session.token);
        }
    }

    async keepLogin() {
        this.loginTimer = setInterval(() => {
            this.login();
        }, 1 * 1000);
    }

  async login() {
    clearInterval(this.loginTimer);
    let userId = "X1L-X-EE";
    let token = "Zd3TZVFpdB85FjbgZTauIUx29mqM9zbqxHpfnBHPBC14sr0/lRD/ueUWND3MGX0qGZzPsUgcwIehNfPvcCM4Tv5bE+p/5GMU58l8LbWeyU3bo8Cd3A4qBwPG/TaKz+iDDvU7SHFDGJC6YHbzgmraUlhV1Ogb7d0nNCgVTDxzVPA=";
    wfc.connect(userId, token);
    return;
  }

    renderCode() {

        return (
            <div className={classes.inner}>
                {
                    this.qrCode && (<img className="disabledDrag" src={this.qrCode} />)
                }

                <a href={window.location.pathname + '?' + +new Date()}>刷新二维码</a>

                <p>扫码登录野火IM</p>
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
