
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import clazz from 'classname';

import Avatar from 'components/Avatar';
import Conversation from '../../../../wfc/model/conversation';
import ConversationType from '../../../../wfc/model/conversationType';
import UserInfo from '../../../../wfc/model/userInfo';
import GroupInfo from '../../../../wfc/model/groupInfo';
import stores from "../../../stores";
import wfc from '../../../../wfc/client/wfc'

import classes from './userStyle.css';
import EventType from "../../../../wfc/client/wfcEvent";

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
    onUserInfosUpdate = (userInfos) =>{
        userInfos.forEach(userInfo => {
            stores.contactInfo.onUserInfoUpdate(userInfo)
        })
    }

    componentWillMount() {
        wfc.eventEmitter.on(EventType.UserInfosUpdate, this.onUserInfosUpdate)
    }

    componentWillUnmount() {
        wfc.eventEmitter.removeListener(EventType.UserInfosUpdate, this.onUserInfosUpdate)
    }
    render() {
        var user = this.props.user;
        var gradient = 'none';
        var fontColor = '#777';
        var buttonColor = '#fff';
        var buttonBackground = '#1aad19';

        var background = '#f5f5f5';
        var usericon = <svg t="1583933524966" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6353" width="16" height="16"><path d="M364.1 440.3c37 39.4 89.6 64 147.8 64 111.9 0 203-91.1 203-203s-91.1-203-203-203-203 91.1-203 203c0 24.1 4.2 47.3 12 68.8 8.3 27 23.4 51.1 43.2 70.2z m146 7.1c-45.7 0-76.7-24.7-81.7-28.9-3.4-2.9-3.8-7.9-1-11.3 2.8-3.4 7.8-3.8 11.2-1l0.1 0.1c6.7 5.7 67.3 53.8 147.3-0.7 3.6-2.5 8.6-1.5 11.1 2.1 2.5 3.7 1.5 8.6-2.1 11.1-31.4 21.4-60.3 28.6-84.9 28.6z m1.8-319.1c95.4 0 173 77.6 173 173 0 81.9-57.2 150.7-133.8 168.5 54.8-26.8 92.5-83.1 92.5-148.2 0-91.1-73.9-165-165-165-36.8 0-70.8 12-98.2 32.4 31.8-37.2 79-60.7 131.5-60.7zM879.8 902.4c-2.7-95.8-42-185.5-110.8-252.5-68.9-67.1-159.9-104.1-256.1-104.1s-187.2 37-256.1 104.1C188 716.8 148.6 806.5 146 902.4c-0.2 6.8 2.3 13.2 7 18 4.7 4.8 11.2 7.6 17.9 7.6h683.9c6.7 0 13.3-2.8 17.9-7.6 4.8-4.8 7.3-11.3 7.1-18zM749 898v-1c-4.4-172.3-134.5-310.5-294.2-310.5-12.2 0-24.2 0.8-36 2.4 29.8-8.5 61.4-13.1 94.1-13.1 182.1 0 329 141.1 336.8 322.3H749z" fill="#2680F0" p-id="6354"></path><path d="M597.2 407.6c-2.5-3.7-7.5-4.6-11.1-2.1-80 54.5-140.6 6.4-147.3 0.7l-0.1-0.1c-3.4-2.8-8.4-2.4-11.2 1-2.8 3.4-2.4 8.4 1 11.3 4.9 4.2 35.9 28.9 81.7 28.9 24.6 0 53.6-7.2 85-28.6 3.5-2.4 4.5-7.4 2-11.1z" fill="#FFFFFF" p-id="6355"></path></svg>;

        let isFriend = wfc.isMyFriend(user.uid);
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
                                    {
                                       isFriend ? (
                                           <div className={classes.area}>
                                               <span>备注:</span>
                                               <span className={!user.friendAlias && classes.editbtn}
                                                     onClick={(ev) => { this.editDesc(ev, user) }}
                                                     onBlur={(e) => { this.editChange(e, user) }}
                                               > {user.friendAlias}</span>
                                           </div>
                                       ) :''
                                    }

                                    <div className={classes.area}><span>地区:</span><span> China</span></div>
                                    <div className={classes.area}><span>野火号:</span> <span> {user.name}</span></div>
                                </div>
                            </div>
                        </div>
                            {
                               isFriend ? (
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
                               ) :(
                                   <div style={{display:'none'}}>
                                       <div
                                           className={classes.action}
                                           onClick={() => this.handleAction(this.props.user)}
                                           style={{
                                               color: buttonColor,
                                               opacity: .6,
                                               background: buttonBackground,
                                               borderRadius: '5px',
                                               fontSize: '19px',
                                               marginRight: '20px',
                                           }}>
                                           接受
                                       </div>
                                       <div
                                           className={classes.action}
                                           onClick={() => this.handleAction(this.props.user)}
                                           style={{
                                               color: buttonColor,
                                               opacity: .6,
                                               background: "red",
                                               borderRadius: '5px',
                                               fontSize: '19px',
                                               marginLeft: '20px'
                                           }}>
                                           拒绝
                                       </div>
                                   </div>
                               )
                            }
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
