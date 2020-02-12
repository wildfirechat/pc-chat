
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import pinyin from '../../../han';
import clazz from 'classname';

import classes from './style.css';
import Avatar from 'components/Avatar';
import Conversation from '../../../../wfc/model/conversation';
import ConversationType from '../../../../wfc/model/conversationType';
import UserInfo from '../../../../wfc/model/userInfo';
import GroupInfo from '../../../../wfc/model/groupInfo';
import wfc from '../../../../wfc/client/wfc'

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
        var buttonColor = '#777';

        var background = '#fff';


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
                            <div
                                className={classes.mask}
                                style={{
                                    background: gradient
                                }} />
                            <Avatar src={user.portrait} />
                        </div>

                        <div
                            className={classes.username}
                            dangerouslySetInnerHTML={{ __html: wfc.getUserDisplayName(user.uid) }} />

                        {
                            /* eslint-disable */
                            // this.state.showEdit && (
                            //     <input
                            //         autoFocus={true}
                            //         defaultValue={RemarkName}
                            //         onKeyPress={e => this.handleEnter(e)}
                            //         placeholder="Type the remark name"
                            //         ref="input"
                            //         type="text" />
                            // )
                            /* eslint-enable */
                        }
                        <div
                            className={classes.action}
                            onClick={() => this.handleAction(this.props.user)}
                            style={{
                                color: buttonColor,
                                opacity: .6,
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

export default withRouter(ContactInfo);
