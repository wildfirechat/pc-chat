
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import clazz from 'classname';

import classes from './style.css';
import Conversation from '../../../../wfc/model/conversation';
import ConversationType from '../../../../wfc/model/conversationType';
import UserInfo from '../../../../wfc/model/userInfo';
import GroupInfo from '../../../../wfc/model/groupInfo';
import UserContactInfo from './UserContactInfo';
import wfc from '../../../../wfc/client/wfc';
// import { use } from 'builder-util';

@inject(stores => ({
    chatTo: (conversation) => {
        stores.members.show = false;
        stores.chat.chatToN(conversation);
    },
    user: stores.contactInfo.user,
    users: stores.contactInfo.users,
    isNewFriend: stores.contactInfo.isNewFriend,
    setRemarkName: stores.userinfo.setRemarkName,
    handleFriendRequest:wfc.handleFriendRequest
}))

@observer
class ContactInfo extends Component {
    state = {
        showEdit: true,
        status:{}
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
    acceptEvent(user){
        console.warn(user);
        this.props.handleFriendRequest(user.uid,true,"", (e)=>{
            console.log('添加好友成功');
            var status = this.state.status;
            status[user.uid] = true;
            this.setState({
                status:status
            })
        }, (e)=>{
            console.log('添加好友失败');
        });
    }
    getUserList() {
        return (
            this.props.user.map((item, index) => {
                var friendMsg = item.friendMsg;
                return (
                    <div className={classes.userList} key={index}>
                        <div className={classes.userItem}>
                            <img src={item.portrait} />
                            <span className={classes.username}>{item.displayName}</span>
                            <span className={classes.userReason}>{item.friendMsg.reason}</span>
                        </div>
                        <div className={classes.userBtns}>
                            {friendMsg.status === 0 && !this.state.status[item.uid]&& <button onClick={()=>{this.acceptEvent(item)}}>接受</button>}
                            {(friendMsg.status === 1 || this.state.status[item.uid])&& <button disabled>已添加</button>}
                            {friendMsg.status === 3 && <button disabled>已拒绝</button>}
                        </div>
                        <div />
                    </div>
                );
            })
        );
    }
    getGroupList() {
        var buttonColor = '#fff';
        var buttonBackground = '#1aad19';
        // var list = this.props.users.map((item, index) => {
        //     return (
        //         <div className={classes.groupList} key={index}>
        //             <div className={classes.groupItem}>
        //                 <img src={item.portrait}></img>
        //                 <span className={classes.groupName}>{item.displayName}</span>
        //             </div>
        //             <div></div>
        //         </div>
        //     )
        // });
        return (
            <div style={{
                height: '100%'
            }}>
                <div className={classes.groupListBox}>
                    <div style={{
                        position: 'absolute',
                        top: '25%',
                        left: '0px',
                        textAlign: 'center',
                        width: '100%'
                    }}>
                        <img style={{
                            width: '80px'
                        }} src={this.props.user.portrait} />
                        <div style={{
                            color: '#000',
                            height: '30px'
                        }}>{this.props.user.name}</div>
                    </div>
                </div>
                <div
                    className={classes.action}
                    onClick={() => this.handleAction(this.props.user)}
                    style={{
                        color: buttonColor,
                        opacity: .6,
                        background: buttonBackground,
                        borderRadius: '5px',
                        fontSize: '19px',
                        left: 'calc(50% - 54px)'
                    }}>
                    发送消息
                </div>
            </div >
        );
    }
    render() {
        var user = this.props.user;
        var users = this.props.users;
        // var gradient = 'none';
        // var fontColor = '#777';
        // var buttonColor = '#fff';
        // var buttonBackground = '#1aad19';
        // var background = '#f5f5f5';
        var _userinfo = ()=>{return <UserContactInfo />};
        var userInfo = user instanceof UserInfo ? _userinfo() : '';
        var groupInfo = user instanceof GroupInfo ? this.getGroupList() : '';
        var userList = this.props.isNewFriend ? this.getUserList() : '';
        return (
            <div className={classes.container}>
                {
                    this.props.isNewFriend ? (<div className={classes.newFriendtitle}>新的朋友</div>) : ''
                }
                {/* {
                    user instanceof GroupInfo ? (<div className={classes.newFriendtitle}>{user.name}({users.length + 1})</div>) : ''
                } */}
                <div style={{
                    height: 'calc(100vh - 70px)',
                    overflow: 'auto'
                }}>

                    {
                        userInfo || userList || groupInfo || (
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

            </div>
        );
    }
}

export default withRouter(ContactInfo);
