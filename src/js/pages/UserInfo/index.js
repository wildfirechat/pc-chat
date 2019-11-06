
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import pinyin from '../../han';
import clazz from 'classname';

import classes from './style.css';
import Avatar from 'components/Avatar';
import { Modal, ModalBody } from 'components/Modal';
import wfc from '../../wfc/client/wfc'
import Conversation from '../../wfc/model/conversation';
import ConversationType from '../../wfc/model/conversationType';
import KickoffGroupMemberNotification from '../../wfc/messages/notification/kickoffGroupMemberNotification';

@inject(stores => ({
    chatTo: (conversation) => {
        stores.members.show = false;
        stores.chat.chatToN(conversation);
    },
    pallet: stores.userinfo.pallet,
    show: stores.userinfo.show,
    user: stores.userinfo.user,
    conversation: stores.userinfo.conversation,
    remove: stores.userinfo.remove,
    toggle: stores.userinfo.toggle,
    setRemarkName: stores.userinfo.setRemarkName,
    removeMember: async (user) => {

        let conversation = stores.userinfo.conversation;
        if (conversation.conversationType === ConversationType.Group) {
            let kickOffNotify = new KickoffGroupMemberNotification(wfc.getUserId(), [user.uid]);
            wfc.kickoffGroupMembers(conversation.target, [user.uid], [0], kickOffNotify,
                () => {
                    console.log('kick off group member success');
                },
                (errorCode) => {
                    console.log('kick off group member failed', errorCode);
                }
            );
        }

        stores.userinfo.toggle(false);
    },
    refreshContacts: async (user) => {
        var { updateUser, filter, filtered } = stores.contacts;

        stores.userinfo.updateUser(user);
        updateUser(user);
        filter(filtered.query);
    },
    showAddFriend: (user) => stores.addfriend.toggle(true, user),
    showMessage: stores.snackbar.showMessage,
    isme: () => {
        let isMe = stores.userinfo.user.uid === wfc.getUserId();
        return isMe;
    },
}))
@observer
class UserInfo extends Component {
    state = {
        showEdit: false,
    };

    toggleEdit(showEdit = !this.state.showEdit) {
        this.setState({ showEdit });
    }

    handleClose() {
        this.toggleEdit(false);
        this.props.toggle(false);
    }

    handleError(e) {
        e.target.src = 'http://i.pravatar.cc/200';
    }

    async handleEnter(e) {
        // 设置好友昵称
        // TODO
        if (e.charCode !== 13) return;

        var value = e.target.value.trim();
        var res = await this.props.setRemarkName(value, this.props.user.UserName);

        if (res) {
            this.props.refreshContacts({
                ...this.props.user,
                RemarkName: value,
                RemarkPYInitial: value ? (pinyin.letter(value, '', null)[0]).toUpperCase() : value,
            });
            this.toggleEdit(false);
        } else {
            this.props.showMessage('Failed to set remark name.');
        }
    }

    handleAction(user) {
        if (this.props.history.location.pathname !== '/') {
            this.props.history.push('/');
        }

        setTimeout(() => {
            //if (helper.isContact(user) || helper.isChatRoom(user.UserName)) {
            if (wfc.isMyFriend(user.uid)) {
                this.props.toggle(false);
                let conversation = new Conversation(ConversationType.Single, user.uid, 0);
                this.props.chatTo(conversation);
                document.querySelector('#messageInput').focus();
            } else {
                this.props.showAddFriend(user);
            }
        });
    }

    render() {
        var { uid, UserName, portrait, displayName, RemarkName = 'remarkName', Signature = 'signature', City = 'city', Province = 'province' } = this.props.user;
        var isFriend = uid ? wfc.isMyFriend(uid) : false;
        var pallet = this.props.pallet;
        var isme = this.props.isme();
        var background = pallet[0];
        var gradient = 'none';
        var fontColor = '#777';
        var buttonColor = '#777';

        if (background) {
            let pallet4font = pallet[1] || [0, 0, 0];
            let pallet4button = pallet[2] || [0, 0, 0];

            gradient = `
                -webkit-linear-gradient(top, rgb(${background[0]}, ${background[1]}, ${background[2]}) 5%, rgba(${background[0]}, ${background[1]}, ${background[2]}, 0) 15%),
                -webkit-linear-gradient(bottom, rgb(${background[0]}, ${background[1]}, ${background[2]}) 5%, rgba(${background[0]}, ${background[1]}, ${background[2]}, 0) 15%),
                -webkit-linear-gradient(left, rgb(${background[0]}, ${background[1]}, ${background[2]}) 5%, rgba(${background[0]}, ${background[1]}, ${background[2]}, 0) 15%),
                -webkit-linear-gradient(right, rgb(${background[0]}, ${background[1]}, ${background[2]}) 5%, rgba(${background[0]}, ${background[1]}, ${background[2]}, 0) 15%)
            `;
            background = `rgba(${background[0]}, ${background[1]}, ${background[2]}, 1)`;
            fontColor = `rgb(
                ${pallet4font[0]},
                ${pallet4font[1]},
                ${pallet4font[2]},
            )`;
            buttonColor = `rgb(
                ${pallet4button[0]},
                ${pallet4button[1]},
                ${pallet4button[2]},
            )`;
        } else {
            background = '#fff';
        }

        return (
            <Modal
                onCancel={() => this.handleClose()}
                show={this.props.show}>
                <ModalBody className={classes.container}>
                    <div
                        className={clazz(classes.hero, {
                            [classes.showEdit]: this.state.showEdit,
                            [classes.large]: !this.props.remove,
                            [classes.isme]: isme,
                        })}
                        onClick={() => {
                            var showEdit = this.state.showEdit;

                            if (showEdit) {
                                this.toggleEdit();
                            }
                        }} style={{
                            background,
                            color: fontColor,
                        }}>

                        {
                            (!isme && isFriend) && (
                                <div
                                    className={classes.edit}
                                    onClick={() => this.toggleEdit()}>
                                    <i className="icon-ion-edit" />
                                </div>
                            )
                        }

                        <div className={classes.inner}>
                            <div
                                className={classes.mask}
                                style={{
                                    background: gradient
                                }} />
                            <Avatar src={portrait} />
                        </div>

                        <div
                            className={classes.username}
                            dangerouslySetInnerHTML={{ __html: displayName }} />

                        {
                            !this.props.remove ? (
                                <div className={classes.wrap}>
                                    <p dangerouslySetInnerHTML={{ __html: Signature || '' }} />

                                    <div className={classes.address}>
                                        <i
                                            className="icon-ion-android-map"
                                            style={{ color: fontColor }} />

                                        {City || 'UNKNOW'}, {Province || 'UNKNOW'}
                                    </div>
                                </div>
                            ) : (
                                    <div
                                        className={classes.action}
                                        onClick={() => this.props.removeMember(this.props.user)}
                                        style={{
                                            color: buttonColor,
                                            opacity: .6,
                                            marginTop: 20,
                                            marginBottom: -30,
                                        }}>
                                        Delete
                                </div>
                                )
                        }

                        <div
                            className={classes.action}
                            onClick={() => this.handleAction(this.props.user)}
                            style={{
                                color: buttonColor,
                                opacity: .6,
                            }}>
                            {isFriend ? 'Send Message' : 'Add Friend'}
                        </div>
                    </div>

                    {
                        /* eslint-disable */
                        this.state.showEdit && (
                            <input
                                autoFocus={true}
                                defaultValue={RemarkName}
                                onKeyPress={e => this.handleEnter(e)}
                                placeholder="Type the remark name"
                                ref="input"
                                type="text" />
                        )
                        /* eslint-enable */
                    }
                </ModalBody>
            </Modal>
        );
    }
}

export default withRouter(UserInfo);
