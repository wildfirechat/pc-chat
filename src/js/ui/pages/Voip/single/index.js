import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';

import clazz from 'classname';
import classes from './style.css';
import {observable, action} from 'mobx';
import CallState from "../../../../wfc/av/engine/callState";
import CallSessionCallback from "../../../../wfc/av/engine/CallSessionCallback";
import avenginekit from "../../../../wfc/av/internal/engine.min";

@observer
export default class Voip extends Component {

    @observable status = 0;
    @observable audioOnly = false;
    @observable duration = '0:0';
    @observable muted = false;

    timer;

    callButton;
    hangupButton;
    toVoiceButton;
    switchMicrophone;
    localVideo;
    remoteVideo;

    events;

    session;


    setupSessionCallback() {
        let sessionCallback = new CallSessionCallback();

        sessionCallback.didChangeState = (state) => {
            this.status = state;
            if (state === CallState.STATUS_CONNECTED) {
                this.onUpdateTime();
            } else if (state === CallState.STATUS_IDLE) {
                if (this.timer) {
                    clearInterval(this.timer);
                }
            }
        };

        sessionCallback.onInitial = (session, selfUserInfo, initiatorUserInfo, participantUserInfos) => {
            this.session = session;
            this.audioOnly = session.audioOnly;
        };

        sessionCallback.didChangeMode = (audioOnly) => {
            this.audioOnly = audioOnly;
        };

        sessionCallback.didCreateLocalVideoTrack = (stream) => {
            this.localVideo.srcObject = stream;
        };

        sessionCallback.didReceiveRemoteVideoTrack = (userId, stream) => {
            this.remoteVideo.srcObject = stream;
        };

        sessionCallback.didVideoMuted = (userId, muted) => {
            this.muted = muted;
        };
        avenginekit.sessionCallback = sessionCallback;
    }

    @action onUpdateTime = () => {
        let elapsedTime = window.performance.now() - this.session.startTime;
        elapsedTime /= 1000;
        this.duration = parseInt(elapsedTime / 60) + ':' + parseInt(elapsedTime % 60);
        if (!this.timer) {
            this.timer = setInterval(this.onUpdateTime, 1000);
        }
        console.log(this.duration);
    };

    componentWillMount() {
        avenginekit.setup();
        this.setupSessionCallback();
    }

    componentDidMount() {
        this.callButton = this.refs.callButton;
        this.hangupButton = this.refs.hangupButton;
        this.toVoiceButton = this.refs.toVoiceButton;
        this.switchMicrophone = this.refs.switchMicorphone;
        this.localVideo = this.refs.localVideo;
        this.remoteVideo = this.refs.remoteVideo;

    }

    componentWillUnmount() {
    }

    videoOutgoingDesc() {
        return (
            <div className={classes.videoOutgoing}>
                <img src={this.session.participantUserInfos[0].portrait}></img>
                <div className={classes.desc}>
                    <p>{this.session.participantUserInfos[0].displayName}</p>
                    <p>正在等待对方接受邀请</p>
                </div>
            </div>
        )
    }

    videoOutgoingOrConnectedAction() {
        return (
            <div className={classes.videoOutgoingOrConnectedAction}>
                <div>
                    <p style={{visibility: 'hidden'}}>holder</p>
                    <img ref="switchMicorphone"
                         src={this.session.muted ? 'assets/images/av_mute_hover.png' : 'assets/images/av_mute.png'}
                         onClick={() => this.session.triggerMicrophone()}
                    >
                    </img>
                    <p>关闭麦克风</p>
                </div>
                <div>
                    <p>{this.duration}</p>
                    <img ref="hangupButton"
                         onClick={() => this.session.hangup()}
                         src='assets/images/av_hang_up.png'></img>
                    <p style={{visibility: 'hidden'}}>holder</p>
                </div>
                <div>
                    <p style={{visibility: 'hidden'}}>holder</p>
                    <img ref="toVoiceButton"
                         src='assets/images/av_phone.png'
                         onClick={() => this.session.downgrade2Voice()}
                    />
                    <p>切换到语音聊天</p>
                </div>
            </div>
        )
    }

    videoIncomingDesc() {
        return (
            <div className={clazz(classes.videoInviter)}>
                <img src={this.session.participantUserInfos[0].portrait}></img>
                <p>{this.session.participantUserInfos[0].displayName}</p>
                <p>邀请你视频通话</p>
            </div>
        )
    }

    videoIncomingAction() {
        return (
            <div>
                <div className={classes.audioAccept}>
                    <img ref="toVoiceButton"
                         onClick={() => this.session.downToVoice()}
                         src='assets/images/av_float_audio.png'>
                    </img>
                    <p>切换到语音聊天</p>
                </div>
                <div className={classes.videoIncomingAction}>
                    <img ref="hangupButton"
                         onClick={() => this.session.hangup()}
                         className={classes.incomingHangup}
                         src='assets/images/av_hang_up.png'>

                    </img>
                    <img ref="callButton"
                         onClick={() => this.session.call()}
                         className={classes.incomingAccept}
                         src='assets/images/av_video_answer.png'></img>
                </div>
            </div>
        )
    }

    audioIncomingDesc() {
        return (
            <div className={clazz(classes.videoInviter)}>
                <img src={this.session.participantUserInfos[0].portrait}></img>
                <p>{this.session.participantUserInfos[0].displayName}</p>
                <p>邀请你语音聊天</p>
            </div>
        )
    }

    audioIncomingAction() {
        return (
            <div className={classes.videoIncomingAction}>
                <img className={classes.incomingHangup} src='assets/images/av_hang_up.png'></img>
                <img className={classes.incomingAccept} src='assets/images/av_video_answer.png'></img>
            </div>
        )
    }

    audioOutgoingDesc() {
        return (
            <div className={clazz(classes.videoInviter)}>
                <img src={this.session.participantUserInfos[0].portrait}></img>
                <p>{this.session.participantUserInfos[0].displayName}</p>
                <p>正在等待对方接受邀请</p>
            </div>
        )
    }

    audioOutgoingAction() {
        return (
            <div className={classes.videoIncomingAction}>
                <img
                    className={classes.audioIncomingHangup}
                    onClick={() => this.session.hangup()}
                    src='assets/images/av_hang_up.png'></img>
            </div>
        )
    }

    audioConnectedDesc() {
        return (
            <div className={clazz(classes.videoInviter)}>
                <img src={this.session.participantUserInfos[0].portrait}></img>
                <p>{this.session.participantUserInfos[0].displayName}</p>
                <p>{this.duration}</p>
            </div>
        )
    }

    audioConnectedAction() {
        return (
            <div className={classes.audioConnectedAction}>
                <div>
                    <img className={classes.audioIncomingHangup}
                         onClick={e => this.session.triggerMicrophone()}
                         src={this.session.muted ? 'assets/images/av_mute_hover.png' : 'assets/images/av_mute.png'}/>
                    <p>关闭麦克风</p>
                </div>
                <img className={classes.audioIncomingHangup}
                     onClick={e => this.session.hangup()}
                     src='assets/images/av_hang_up.png'></img>
            </div>
        )
    }

    audioIncomingAction() {
        return (
            <div className={classes.videoIncomingAction}>
                <img className={classes.incomingHangup}
                     onClick={e => this.session.hangup()}
                     src='assets/images/av_hang_up.png'
                ></img>
                <img className={classes.incomingAccept}
                     onClick={e => this.session.call()}
                     src='assets/images/av_video_answer.png'
                ></img>
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

    renderIdle() {
        // return (
        //     <div>
        //         <p>WFC Voip</p>
        //     </div>
        // );
    }

    renderVideo() {
        let renderFn;
        console.log('xxx render video ', this.status);
        switch (this.status) {
            case CallState.STATUS_IDLE:
                renderFn = this.renderIdle;
                break;
            case CallState.STATUS_INCOMING:
                renderFn = this.renderIncomingVideo;
                break;
            case CallState.STATUS_OUTGOING:
                renderFn = this.renderOutgoingVideo;
                break;
            case CallState.STATUS_CONNECTING:
            case CallState.STATUS_CONNECTED:
                renderFn = this.renderConnectedVideo;
                break;
            default:
                break;

        }
        return (
            <div className={classes.container}>
                <video ref="localVideo" className={classes.localVideo} playsInline autoPlay muted>

                </video>

                <video ref="remoteVideo" className={classes.remoteVideo} playsInline autoPlay hidden={false}>
                </video>
                {
                    renderFn.bind(this)()
                }

            </div>
        );
    }

    renderAudio() {
        let renderFn;
        switch (this.status) {
            case CallState.STATUS_IDLE:
                renderFn = this.renderIdle;
                break;
            case CallState.STATUS_INCOMING:
                renderFn = this.renderIncomingAudio;
                break;
            case CallState.STATUS_OUTGOING:
                renderFn = this.renderOutgoingAudio;
                break;
            case CallState.STATUS_CONNECTING:
            case CallState.STATUS_CONNECTED:
                renderFn = this.renderConnectedAudio;
                break;
            default:
                break;

        }
        return (
            <div className={classes.container}>
                {
                    renderFn.bind(this)()
                }

            </div>
        );

    }

    render() {
        return this.audioOnly ? this.renderAudio() : this.renderVideo();
    }
}
