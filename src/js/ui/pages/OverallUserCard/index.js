
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import clazz from 'classname';

import classes from './style.css';

import { withRouter } from 'react-router-dom';

import { inject, observer } from 'mobx-react';
import Conversation from '../../../wfc/model/conversation';
import ConversationType from '../../../wfc/model/conversationType';
import UserInfo from '../../../wfc/model/userInfo';

import wfc from '../../../wfc/client/wfc';

@inject(stores => ({
    showConversation: stores.chat.showConversation,
    showCard: stores.OverallUserCard.show,
    config:stores.OverallUserCard.config,
    user: stores.OverallUserCard.user,
    isMyFriend: stores.OverallUserCard.isMyFriend,
    close: ()=>{stores.OverallUserCard.toggle(false)},
    chatTo: (conversation) => {
        stores.members.show = false;
        stores.chat.chatToN(conversation);
    },
    sendFriendRequest: (reason, uid, successCB, failCB) => {
        wfc.sendFriendRequest(uid, reason, (e) => { successCB && successCB(e) }, (e) => { failCB && failCB(e) });
    }
}))
@observer
class OverallUserCard extends Component {
    state = {
        selected: [],
        active: '',
        isShowAddCard: false,
        reason: ''
    };
    backTo() {
        if (this.props.history.location.pathname !== '/') {
            this.props.history.push('/');
        }
    }
    handleAction(user) {
        var context = this;
        setTimeout(() => {

            var conversation;
            if (user instanceof UserInfo) {
                conversation = new Conversation(ConversationType.Single, user.uid, 0);
            } else if (user instanceof GroupInfo) {
                conversation = new Conversation(ConversationType.Group, user.target, 0);
            } else {
                console.log('contactInfo unknown', user);
                return;
            }
            context.props.chatTo(conversation);
            context.backTo();
            // context.props.hideCard();
            context.props.close();
            document.querySelector('#messageInput').focus();
        });
    }
    handleChange(e) {
        console.warn(e.target.value);
        this.setState({
            reason: e.target.value
        });
    }
    showAddCard() {
        this.setState({
            isShowAddCard: true,
            reason: ('我是' + WildFireIM.config.loginUser.displayName)
        });
        // this.props.addUserEvent && this.props.addUserEvent();
        // this.props.sendFriendRequest()
    }
    cancelbtn() {
        this.setState({
            isShowAddCard: false,
            reason: ''
        });
    }
    addUser() {
        this.setState({
            isShowAddCard: false,
            reason: ''
        });
        var reason = this.state.reason ? this.state.reason : '我是 ' + WildFireIM.config.loginUser.displayName;
        this.props.sendFriendRequest(reason, this.props.user.uid);
    }
    componentWillMount() {
        var bodyDom = document.body;
        var content= this;
        bodyDom.addEventListener('click', (e) => {
            if (!e.target.closest('.' + classes.container) && e.target.className != classes.container) {
                if (content.props.showCard) {
                    // this.props.hideCard();
                    content.props.close();
                    content.setState({
                        isShowAddCard: false,
                        reason: ''
                    })

                }
            }
        });
      
    }

    render() {
        var usericon = <svg t="1583933524966" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6353" width="16" height="16"><path d="M364.1 440.3c37 39.4 89.6 64 147.8 64 111.9 0 203-91.1 203-203s-91.1-203-203-203-203 91.1-203 203c0 24.1 4.2 47.3 12 68.8 8.3 27 23.4 51.1 43.2 70.2z m146 7.1c-45.7 0-76.7-24.7-81.7-28.9-3.4-2.9-3.8-7.9-1-11.3 2.8-3.4 7.8-3.8 11.2-1l0.1 0.1c6.7 5.7 67.3 53.8 147.3-0.7 3.6-2.5 8.6-1.5 11.1 2.1 2.5 3.7 1.5 8.6-2.1 11.1-31.4 21.4-60.3 28.6-84.9 28.6z m1.8-319.1c95.4 0 173 77.6 173 173 0 81.9-57.2 150.7-133.8 168.5 54.8-26.8 92.5-83.1 92.5-148.2 0-91.1-73.9-165-165-165-36.8 0-70.8 12-98.2 32.4 31.8-37.2 79-60.7 131.5-60.7zM879.8 902.4c-2.7-95.8-42-185.5-110.8-252.5-68.9-67.1-159.9-104.1-256.1-104.1s-187.2 37-256.1 104.1C188 716.8 148.6 806.5 146 902.4c-0.2 6.8 2.3 13.2 7 18 4.7 4.8 11.2 7.6 17.9 7.6h683.9c6.7 0 13.3-2.8 17.9-7.6 4.8-4.8 7.3-11.3 7.1-18zM749 898v-1c-4.4-172.3-134.5-310.5-294.2-310.5-12.2 0-24.2 0.8-36 2.4 29.8-8.5 61.4-13.1 94.1-13.1 182.1 0 329 141.1 336.8 322.3H749z" fill="#2680F0" p-id="6354"></path><path d="M597.2 407.6c-2.5-3.7-7.5-4.6-11.1-2.1-80 54.5-140.6 6.4-147.3 0.7l-0.1-0.1c-3.4-2.8-8.4-2.4-11.2 1-2.8 3.4-2.4 8.4 1 11.3 4.9 4.2 35.9 28.9 81.7 28.9 24.6 0 53.6-7.2 85-28.6 3.5-2.4 4.5-7.4 2-11.1z" fill="#FFFFFF" p-id="6355"></path></svg>;
        var message = <svg t="1583935908174" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7577" width="32" height="32"><path d="M347.554694 958.708971a34.381042 34.381042 0 0 1-15.352663-3.61534 34.375925 34.375925 0 0 1-19.009959-30.746259V794.951327C161.80006 730.228233 65.290005 597.133959 65.290005 450.154443c0-212.214263 200.384843-384.864438 446.708972-384.864438S958.708971 237.940181 958.708971 450.154443c0 208.857818-194.093557 379.385657-435.048397 384.729362L368.208083 951.804724a34.305317 34.305317 0 0 1-20.653389 6.904247z m164.445306-824.693721c-208.42189 0-377.98475 141.820006-377.98475 316.139193 0 125.050064 88.506776 238.598166 225.469148 289.285593 13.472849 4.983501 22.432918 17.844413 22.432918 32.222889v83.833337l109.429295-82.306565a34.362622 34.362622 0 0 1 20.654412-6.904247c208.42189 0 377.98475-141.820006 377.984751-316.131007C889.98475 275.835256 720.42189 134.01525 512 134.01525z" fill="#444444" p-id="7578"></path><path d="M490.388796 675.170267c-124.697023 0-226.391147-74.748425-272.045952-199.940729l80.704066-29.429263c33.238009 91.174536 102.986559 143.464459 191.341886 143.46446v85.905532z" fill="#00D8A0" p-id="7579"></path></svg>;
        var addUser = <svg t="1584022187270" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2064" width="32" height="32"><path d="M542.24 542.72c-114.24 0-207.36-93.12-207.36-207.36S427.52 128 542.24 128s207.36 93.12 207.36 207.36-93.12 207.36-207.36 207.36z m0-366.24C454.4 176.48 383.36 248 383.36 335.36c0 87.36 71.04 158.88 158.88 158.88 87.36 0 158.88-71.04 158.88-158.88 0-87.36-71.52-158.88-158.88-158.88z" fill="#2c2c2c" p-id="2065"></path><path d="M189.92 894.56c-13.44 0-24.48-11.04-24.48-24.48 0-207.84 168.96-376.8 376.8-376.8 13.44 0 24.48 11.04 24.48 24.48s-11.04 24.48-24.48 24.48C361.28 542.24 214.4 689.6 214.4 870.08c-0.48 13.44-11.04 24.48-24.48 24.48zM831.2 764.96h-182.88c-13.92 0-24.96-11.04-24.96-24.96 0-13.92 11.04-24.96 24.96-24.96h182.88c13.92 0 24.96 11.04 24.96 24.96 0 13.92-11.04 24.96-24.96 24.96z" fill="#2c2c2c" p-id="2066"></path><path d="M714.56 831.68v-182.88c0-13.92 11.04-24.96 24.96-24.96 13.92 0 24.96 11.04 24.96 24.96v182.88c0 13.92-11.04 24.96-24.96 24.96-13.44 0-24.96-11.04-24.96-24.96z" fill="#2c2c2c" p-id="2067"></path></svg>

        var { showCard, user, config, isMyFriend } = this.props;
        var winHeight = document.body.offsetHeight;
        // var winWidth = document.body.offsetWidth;
        if (config.top + 200 > winHeight) {
            config.top = winHeight - 250;
        }
        return (
            <div className={classes.container} style={{ display: (showCard ? 'block' : 'none'), ...config }}>
                <div className={classes.top}>
                    <div className={classes.displayName}><span>{user.displayName}</span>{usericon}</div>
                    <div className={classes.uid} > 野火用户ID :<span>{user.uid}</span></div>
                    <div className={classes.image}><img src={user.portrait} /></div>
                </div>
                <div className={classes.bottom} >
                    <div className={classes.area}>地区： <span> China</span></div>
                    <div className={classes.btns}>
                        {
                            !isMyFriend ? <span onClick={() => { this.showAddCard(user)}}>{addUser}</span> :
                                <span onClick={() => { this.handleAction(user) }}>{message}</span>
                        }
                    </div>
                </div>
                {this.state.isShowAddCard ? <div className={classes.alertcontent} >
                    <div className={classes.title}>添加朋友</div>
                    <textarea onChange={(ev)=>{ this.handleChange(ev) }} value={this.state.reason}></textarea>
                    <div className={classes.desc}>你需要发送验证请求，对方通过后你才能添加其为朋友</div>
                    <div className={classes.btns}>
                        <button className={classes.subbtn} onClick={() => { this.addUser() }}>确定</button>
                        <button className={classes.cancelbtn} onClick={() => { this.cancelbtn() }}>取消</button>
                    </div>
                </div> : ""
                }
            </div>
        );
    }
}

export default withRouter(OverallUserCard);