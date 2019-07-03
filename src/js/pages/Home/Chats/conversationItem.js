
import React, { Component } from 'react';
import clazz from 'classname';
import helper from 'utils/helper';

import classes from './style.css';
import ConversationType from '../../../wfc/model/conversationType';

export default class ConversationItem extends Component {
    active = false;

    shouldComponentUpdate(nextProps) {
        return !this.props.conversationInfo
            || !nextProps.currentConversation
            || !nextProps.conversationInfo.conversation.equal(this.props.conversationInfo.conversation)
            || this.props.conversationInfo.lastMessage.messageId !== nextProps.conversationInfo.lastMessage.messageId
            || this.active !== (nextProps.currentConversation.equal(nextProps.conversationInfo.conversation))
            ;

    }

    render() {
        let e = this.props.conversationInfo;
        let conversation = this.props.currentConversation;
        this.active = conversation && conversation.equal(e.conversation);
        let chatTo = this.props.chatTo;
        var muted = e.isSilent;
        var isTop = e.isTop;
        let unreadCount = e.unreadCount;
        let hasUnread = unreadCount.unread > 0 || unreadCount.unreadMention > 0 || unreadCount.unreadMentionAll > 0;
        var portrait = e.portrait();
        let txtUnread = unreadCount.unread > 99 ? "..." : unreadCount.unread;

        if (!portrait) {
            switch (e.conversation.conversationType) {
                case ConversationType.Single:
                    portrait = 'assets/images/user-fallback.png';
                    break;
                case ConversationType.Group:
                    portrait = 'assets/images/default_group_avatar.png';
                    break;
                default:
                    break;
            }
        }

        return (
            <div
                className={clazz(classes.chat, {
                    [classes.sticky]: isTop,
                    [classes.active]: this.active,
                })}
                // TODO key should be conversation
                onContextMenu={ev => this.showContextMenu(e)}
                onClick={ev => chatTo(e.conversation)}>
                <div className={classes.inner}>
                    <div data-aftercontent={txtUnread} className={clazz(classes.dot, {
                        [classes.green]: muted && hasUnread,
                        [classes.red]: !muted && hasUnread
                    })}>
                        <img
                            className="disabledDrag"
                            // TODO portrait
                            src={portrait}
                            onError={e => (e.target.src = 'assets/images/user-fallback.png')}
                        />
                    </div>

                    <div className={classes.info}>
                        <p
                            className={classes.username}
                            dangerouslySetInnerHTML={{ __html: e.title() }} />

                        <span
                            className={classes.message}
                            dangerouslySetInnerHTML={{ __html: e.lastMessage ? e.lastMessage.messageContent.digest() : '' }} />
                    </div>
                </div>

                <span className={classes.times}>
                    {
                        e.timestamp ? helper.timeFormat(e.timestamp) : ''
                    }
                </span>
            </div>
        );

    }

}
