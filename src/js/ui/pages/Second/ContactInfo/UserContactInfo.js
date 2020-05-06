
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import clazz from 'classname';

import Avatar from 'components/Avatar';
import Conversation from '../../../../wfc/model/conversation';
import ConversationType from '../../../../wfc/model/conversationType';
import UserInfo from '../../../../wfc/model/userInfo';
import GroupInfo from '../../../../wfc/model/groupInfo';
import wfc from '../../../../wfc/client/wfc'

import classes from './userStyle.css';

@inject(stores => ({

    chatTo: (conversation) => {
        stores.members.show = false;
        stores.chat.chatToN(conversation);
    },
    user: stores.contactInfo.user,
    setFriendAlias: wfc.setFriendAlias
}))

@observer
class UserContactInfo extends Component {
    state = {
        chatTo: (conversation) => {
            stores.members.show = false;
            stores.chat.chatToN(conversation);
        },
        showEdit: true,
    };

    handleAction(user) {

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
            this.props.chatTo(conversation);
            if (this.props.history.location.pathname !== '/') {
                this.props.history.push('/');
            }
            document.querySelector('#messageInput').focus();
        });
    }
    editDesc(ev) {
        var sp = ev.target;
        sp.setAttribute('contenteditable', true);
        sp.className=classes.editSpan;
        sp.setAttribute('tabindex', 0);
        sp.onkeydown = (e) => {
            if (e.keyCode === 13) {
                e.target.blur();
            }
         }
        sp.focus();
    }
    editChange(ev,user) {
        var sp = ev.target;
        sp.setAttribute('contenteditable', false);
        if(!ev.target.innerHTML || ev.target.innerHTML.trim().length===0){
            sp.className=classes.editbtn;
        }else{
            sp.className='';
        }
        this.props.setFriendAlias(user.uid,ev.target.innerHTML,(e)=>{
            console.warn("修改备注名称成功")
        },(e)=>{
            console.warn('修改备注失败！')
        })
    }
    render() {
        var user = this.props.user;
        var gradient = 'none';
        var fontColor = '#777';
        var buttonColor = '#fff';
        var buttonBackground = '#1aad19';

        var background = '#f5f5f5';
        var usericon = <svg t="1583933524966" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6353" width="16" height="16"><path d="M364.1 440.3c37 39.4 89.6 64 147.8 64 111.9 0 203-91.1 203-203s-91.1-203-203-203-203 91.1-203 203c0 24.1 4.2 47.3 12 68.8 8.3 27 23.4 51.1 43.2 70.2z m146 7.1c-45.7 0-76.7-24.7-81.7-28.9-3.4-2.9-3.8-7.9-1-11.3 2.8-3.4 7.8-3.8 11.2-1l0.1 0.1c6.7 5.7 67.3 53.8 147.3-0.7 3.6-2.5 8.6-1.5 11.1 2.1 2.5 3.7 1.5 8.6-2.1 11.1-31.4 21.4-60.3 28.6-84.9 28.6z m1.8-319.1c95.4 0 173 77.6 173 173 0 81.9-57.2 150.7-133.8 168.5 54.8-26.8 92.5-83.1 92.5-148.2 0-91.1-73.9-165-165-165-36.8 0-70.8 12-98.2 32.4 31.8-37.2 79-60.7 131.5-60.7zM879.8 902.4c-2.7-95.8-42-185.5-110.8-252.5-68.9-67.1-159.9-104.1-256.1-104.1s-187.2 37-256.1 104.1C188 716.8 148.6 806.5 146 902.4c-0.2 6.8 2.3 13.2 7 18 4.7 4.8 11.2 7.6 17.9 7.6h683.9c6.7 0 13.3-2.8 17.9-7.6 4.8-4.8 7.3-11.3 7.1-18zM749 898v-1c-4.4-172.3-134.5-310.5-294.2-310.5-12.2 0-24.2 0.8-36 2.4 29.8-8.5 61.4-13.1 94.1-13.1 182.1 0 329 141.1 336.8 322.3H749z" fill="#2680F0" p-id="6354"></path><path d="M597.2 407.6c-2.5-3.7-7.5-4.6-11.1-2.1-80 54.5-140.6 6.4-147.3 0.7l-0.1-0.1c-3.4-2.8-8.4-2.4-11.2 1-2.8 3.4-2.4 8.4 1 11.3 4.9 4.2 35.9 28.9 81.7 28.9 24.6 0 53.6-7.2 85-28.6 3.5-2.4 4.5-7.4 2-11.1z" fill="#FFFFFF" p-id="6355"></path></svg>;
        var message = <svg t="1583935908174" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7577" width="32" height="32"><path d="M347.554694 958.708971a34.381042 34.381042 0 0 1-15.352663-3.61534 34.375925 34.375925 0 0 1-19.009959-30.746259V794.951327C161.80006 730.228233 65.290005 597.133959 65.290005 450.154443c0-212.214263 200.384843-384.864438 446.708972-384.864438S958.708971 237.940181 958.708971 450.154443c0 208.857818-194.093557 379.385657-435.048397 384.729362L368.208083 951.804724a34.305317 34.305317 0 0 1-20.653389 6.904247z m164.445306-824.693721c-208.42189 0-377.98475 141.820006-377.98475 316.139193 0 125.050064 88.506776 238.598166 225.469148 289.285593 13.472849 4.983501 22.432918 17.844413 22.432918 32.222889v83.833337l109.429295-82.306565a34.362622 34.362622 0 0 1 20.654412-6.904247c208.42189 0 377.98475-141.820006 377.984751-316.131007C889.98475 275.835256 720.42189 134.01525 512 134.01525z" fill="#444444" p-id="7578"></path><path d="M490.388796 675.170267c-124.697023 0-226.391147-74.748425-272.045952-199.940729l80.704066-29.429263c33.238009 91.174536 102.986559 143.464459 191.341886 143.46446v85.905532z" fill="#00D8A0" p-id="7579"></path></svg>;
        var addUser = <svg t="1584022187270" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2064" width="32" height="32"><path d="M542.24 542.72c-114.24 0-207.36-93.12-207.36-207.36S427.52 128 542.24 128s207.36 93.12 207.36 207.36-93.12 207.36-207.36 207.36z m0-366.24C454.4 176.48 383.36 248 383.36 335.36c0 87.36 71.04 158.88 158.88 158.88 87.36 0 158.88-71.04 158.88-158.88 0-87.36-71.52-158.88-158.88-158.88z" fill="#2c2c2c" p-id="2065"></path><path d="M189.92 894.56c-13.44 0-24.48-11.04-24.48-24.48 0-207.84 168.96-376.8 376.8-376.8 13.44 0 24.48 11.04 24.48 24.48s-11.04 24.48-24.48 24.48C361.28 542.24 214.4 689.6 214.4 870.08c-0.48 13.44-11.04 24.48-24.48 24.48zM831.2 764.96h-182.88c-13.92 0-24.96-11.04-24.96-24.96 0-13.92 11.04-24.96 24.96-24.96h182.88c13.92 0 24.96 11.04 24.96 24.96 0 13.92-11.04 24.96-24.96 24.96z" fill="#2c2c2c" p-id="2066"></path><path d="M714.56 831.68v-182.88c0-13.92 11.04-24.96 24.96-24.96 13.92 0 24.96 11.04 24.96 24.96v182.88c0 13.92-11.04 24.96-24.96 24.96-13.44 0-24.96-11.04-24.96-24.96z" fill="#2c2c2c" p-id="2067"></path></svg>


        console.warn(user);

        return (
            <div className={classes.container}>
                {
                    user ? (<div
                        className={clazz(classes.hero)}
                        style={{
                            background,
                            color: fontColor,
                        }}>
                        <div className={classes.inner}>

                            <div className={classes.container} >
                                <div className={classes.top}>
                                    <div className={classes.displayName}><span>{user.displayName}</span>{usericon}</div>
                                    <div className={classes.uid} ><span>{user.extra}</span></div>
                                    <div className={classes.image}><img src={user.portrait} /></div>
                                </div>
                                <div className={classes.bottom} >
                                    <div className={classes.area}><span>备注:</span>
                                    <span className={!user.friendAlias && classes.editbtn} 
                                    onClick={(ev) => { this.editDesc(ev, user) }}
                                    onBlur={(e) => { this.editChange(e, user) }}
                                    > {user.friendAlias}</span></div>

                                    <div className={classes.area}><span>地区:</span><span> China</span></div>

                                    <div className={classes.area}><span>野火号:</span> <span> {user.uid}</span></div>

                                    {/* <div className={classes.area}>来源： <span> China</span></div> */}
                                    {/* <div className={classes.btns}>
                                        {
                                            this.props.isCurrentUser ? <span onClick={() => { this.handleAction(user) }}>{addUser}</span> :
                                                <span onClick={() => { this.handleAction(user) }}>{message}</span>
                                        }
                                    </div> */}
                                </div>
                            </div>
                        </div>
                        {/* 
                        <div
                            className={classes.username}
                            dangerouslySetInnerHTML={{ __html: wfc.getUserDisplayName(user.uid) }} /> */}
                        <div
                            className={classes.action}
                            onClick={() => this.handleAction(this.props.user)}
                            style={{
                                color: buttonColor,
                                opacity: .6,
                                background: buttonBackground,
                                borderRadius: '5px',
                                fontSize: '19px'
                            }}>
                            发送消息
                        </div>
                    </div>
                    ) : (
                            <div className={clazz({
                                [classes.noselected]: true,
                            })}>
                                <img
                                    className="disabledDrag"
                                    src="assets/images/noselected.png" />
                                <h1>No Contact selected :(</h1>
                            </div>
                        )
                }
            </div>
        );
    }
}

export default withRouter(UserContactInfo);
