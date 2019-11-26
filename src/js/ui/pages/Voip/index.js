
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import clazz from 'classname';
import classes from './style.css';
import Config from '../../../config';
import jrQRCode from 'jr-qrcode'
import wfc from '../../../wfc/client/wfc'
import PCSession from '../../../wfc/model/pcsession';
import { observable } from 'mobx';
import axios from 'axios';
import { connect } from '../../../platform'

@inject(stores => ({
    avatar: stores.sessions.avatar,
    code: stores.sessions.code,
}))
@observer
export default class Voip extends Component {
    @observable qrCode;
    token;
    loginTimer;
    qrCodeTimer;
    status;

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    renderAudioIncomingAction() {

    }

    renderAudioOutgoingOrConnectedAction() {

    }

    videoOutgoingDesc() {
        return (
            <div className={classes.videoOutgoing}>
                <img src='assets/images/offline.png'></img>
                <div className={classes.desc}>
                    <p>xxx</p>
                    <p>正在等待对方接受邀请</p>
                </div>
            </div>
        )
    }

    videoOutgoingOrConnectedAction() {
        return (
            <div className={classes.videoOutgoingOrConnectedAction}>
                <div>
                    <p style={{ visibility: 'hidden' }}>holder</p>
                    <img src='assets/images/av_mute.png'></img>
                    <p>关闭麦克风</p>
                </div>
                <div>
                    <p>10:00</p>
                    <img src='assets/images/av_hang_up.png'></img>
                    <p style={{ visibility: 'hidden' }}>holder</p>
                </div>
                <div>
                    <p style={{ visibility: 'hidden' }}>holder</p>
                    <img src='assets/images/av_phone.png'></img>
                    <p>切换到语音聊天</p>
                </div>
            </div>
        )
    }

    videoIncomingDesc() {
        return (
            <div className={clazz(classes.videoInviter)}>
                <img src='assets/images/offline.png'></img>
                <p>xxxx</p>
                <p>邀请你视频通话</p>
            </div>
        )
    }

    videoIncomingAction() {
        return (
            <div>
                <div className={classes.audioAccept}>
                    <img src='assets/images/offline.png'></img>
                    <p>切换到语音聊天</p>
                </div>
                <div className={classes.videoIncomingAction}>
                    <img className={classes.incomingHangup} src='assets/images/offline.png'></img>
                    <img className={classes.incomingAccept} src='assets/images/offline.png'></img>
                </div>
            </div>
        )
    }

    audioIncomingDesc() {
        return (
            <div className={clazz(classes.videoInviter)}>
                <img src='assets/images/offline.png'></img>
                <p>xxxx</p>
                <p>邀请你语音聊天</p>
            </div>
        )
    }

    audioIncomingAction() {
        return (
            <div className={classes.videoIncomingAction}>
                <img className={classes.incomingHangup} src='assets/images/offline.png'></img>
                <img className={classes.incomingAccept} src='assets/images/offline.png'></img>
            </div>
        )
    }

    audioOutgoingDesc() {
        return (
            <div className={clazz(classes.videoInviter)}>
                <img src='assets/images/offline.png'></img>
                <p>xxxx</p>
                <p>正在等待对方接受邀请</p>
            </div>
        )
    }

    audioOutgoingAction() {
        return (
            <div className={classes.videoIncomingAction}>
                <img className={classes.audioIncomingHangup} src='assets/images/offline.png'></img>
            </div>
        )
    }

    audioConnectedDesc() {
        return (
            <div className={clazz(classes.videoInviter)}>
                <img src='assets/images/offline.png'></img>
                <p>xxxx</p>
                <p>00:03</p>
            </div>
        )
    }

    audioConnectedAction() {
        return (
            <div className={classes.audioConnectedAction}>
                <div>
                    <img className={classes.audioIncomingHangup} src='assets/images/offline.png'></img>
                    <p>关闭麦克风</p>
                </div>
                <img className={classes.audioIncomingHangup} src='assets/images/offline.png'></img>
            </div>
        )
    }

    audioIncomingAction() {
        return (
            <div className={classes.videoIncomingAction}>
                <img className={classes.incomingHangup} src='assets/images/offline.png'></img>
                <img className={classes.incomingAccept} src='assets/images/offline.png'></img>
            </div>
        )
    }

    renderIncomingAudio() {
        return (
            <div>
                {
                    this.audioIncomingDesc()
                }
                {

                    this.audioIncomingAction()
                }
            </div>
        )
    }

    renderOutgoingAudio() {
        return (
            <div>
                {
                    this.audioOutgoingDesc()
                }
                {

                    this.audioOutgoingAction()
                }
            </div>
        )
    }

    renderConnectedAudio() {
        return (
            <div>
                {
                    this.audioConnectedDesc()
                }
                {

                    this.audioConnectedAction()
                }
            </div>
        )
    }

    renderIncomingVideo() {
        return (
            <div>
                {
                    this.videoIncomingDesc()
                }
                {

                    this.videoIncomingAction()
                }
            </div>
        )
    }

    renderOutgoingVideo() {
        return (
            <div>
                {
                    this.videoOutgoingDesc()
                }
                {
                    this.videoOutgoingOrConnectedAction()
                }
            </div>
        )
    }

    renderConnectedVideo() {
        return this.videoOutgoingOrConnectedAction()
    }

    renderVideo() {
        return (
            <div className={classes.container}>
                <video className={classes.remoteVideo}>

                </video>

                <video className={classes.localVideo}>
                </video>
                {
                    this.renderConnectedVideo()
                }

            </div>
        );
    }

    renderAudio() {

    }

    render() {
        this.status = 1;
        // incominig
        if (this.status === 1) {
            return this.renderVideo();
            // incoming connected
        } else if (this.status === 2) {
            return (
                <div className={classes.cobntainer}>
                    <video className={classes.localVideo}>

                    </video>

                    <video className={classes.remoteVideo}>

                    </video>
                    <div className={classes.action}>
                        <img className={classes.hangup} src='assets/images/offline.png'></img>
                        <img className={classes.accept} src='assets/images/offline.png'></img>
                    </div>
                </div>
            );

            // outgoing
        } else {

        }
    }
}
