
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

@inject(stores => ({
    chatTo: (conversation) => {
        stores.members.show = false;
        stores.chat.chatToN(conversation);
    },
    user: stores.contactInfo.user,
    setRemarkName: stores.userinfo.setRemarkName,
}))

@observer
class ContactInfo extends Component {
    state = {
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

    render() {
        var user = this.props.user;
        var gradient = 'none';
        var fontColor = '#777';
        var buttonColor = '#fff';
        var buttonBackground = '#1aad19';
        var background = '#f5f5f5';
        return (
            <div className={classes.container}>
                {
                    user.target || user.uid ? (<UserContactInfo></UserContactInfo>) : (
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

export default withRouter(ContactInfo);
