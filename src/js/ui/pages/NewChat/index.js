
import React, { Component } from 'react';
import { Modal, ModalBody } from 'components/Modal';
import { inject, observer } from 'mobx-react';

import classes from './style.css';
import UserList from 'components/UserList';
import helper from 'utils/helper';
import wfc from '../../../wfc/client/wfc'
import Conversation from '../../../wfc/model/conversation';
import ConversationType from '../../../wfc/model/conversationType';
import MessageContentMediaType from '../../../wfc/messages/messageContentMediaType';
import GroupType from "../../../wfc/model/groupType";

@inject(stores => ({
    show: stores.newchat.show,
    searching: stores.newchat.query,
    mergeImages: stores.newchat.mergeImages,
    getList: () => {
        var { newchat, contacts } = stores;

        contacts.getContacts();
        if (newchat.query) {
            return newchat.list;
        }

        return contacts.memberList;
    },
    getUser: (userid) => {
        return wfc.getUserInfo(userid);
    },
    search: stores.newchat.search,
    close: () => {
        stores.newchat.reset();
        stores.newchat.toggle(false);
    },
    chatTo: (conversation) => stores.chat.chatToN(conversation),
}))
@observer
export default class NewChat extends Component {
    state = {
        selected: [],
    };

    async chat() {
        var selected = this.state.selected;

        if (selected.length === 1) {
            let conversation = new Conversation(ConversationType.Single, selected[0], 0);
            this.props.chatTo(conversation);
        } else {
            // You can not create a chat room by another chat room
            // createChatroom()
            let groupName = '';
            for (let i = 0; i < 3 && i < selected.length; i++) {
                groupName += wfc.getUserDisplayName(selected[i]) + '、';
            }
            groupName = groupName.substr(0, groupName.lastIndexOf('、'))

            var portraits = [];
            selected.splice(0, 0, wfc.getUserId());
            for (let i = 0; i < 9 && i < selected.length; i++) {
                let userInfo = wfc.getUserInfo(selected[i]);
                portraits.push(userInfo.portrait);
            }
            let dataUri = await this.props.mergeImages(portraits);

            wfc.uploadMedia('', dataUri, MessageContentMediaType.Portrait,
                (remoteUrl) => {
                    wfc.createGroup(null, GroupType.Restricted, groupName, remoteUrl, selected, [0], null,
                        (groupId) => {
                            let conversation = new Conversation(ConversationType.Group, groupId);
                            this.props.chatTo(conversation);
                        },
                        (errorCode) => {
                            console.log('create group error', errorCode);
                        });
                },
                (errorCode) => {
                    console.log('upload media error', errorCode);
                },
                (current, total) => {
                    // do nothing
                });
        };

        this.close();
        setTimeout(() => {
            document.querySelector('#messageInput').focus();
        });
    }

    close() {
        this.props.close();
        this.setState({
            selected: [],
        });
    }

    renderList() {
        var self = this;
        var { show, searching, search, getList } = this.props;

        if (!show) {
            return false;
        }

        return (
            <UserList {...{
                ref: 'users',

                search,
                getList,
                searching,

                onChange(selected) {
                    self.setState({
                        selected,
                    });
                }
            }} />
        );
    }

    render() {
        return (
            <Modal
                fullscreen={true}
                onCancel={e => this.props.close()}
                show={this.props.show}>
                <ModalBody className={classes.container}>
                    New Chat ({this.state.selected.length} / 20)

                    <div className={classes.avatars}>
                        {
                            this.state.selected.map((e, index) => {
                                var user = this.props.getUser(e);
                                return (
                                    <img
                                        key={index}
                                        onClick={ev => this.refs.users.removeSelected(e)}
                                        src={user.portrait} />
                                );
                            })
                        }
                    </div>

                    {this.renderList()}

                    <div>
                        <button
                            disabled={!this.state.selected.length}
                            onClick={e => this.chat()}>
                            发起聊天
                        </button>

                        <button onClick={e => this.close()}>取消</button>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}
