
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { remote } from 'electron';
import clazz from 'classname';
import moment from 'moment';

import classes from './style.css';
import EventType from '../../../wfc/wfcEvent'
import ConversationType from '../../../wfc/model/conversationType';

moment.updateLocale('en', {
    relativeTime: {
        past: '%s',
        m: '1 min',
        mm: '%d mins',
        h: 'an hour',
        hh: '%d h',
        s: 'now',
        ss: '%d s',
    },
});

@inject(stores => ({
    chats: stores.sessions.conversations,
    chatTo: stores.chat.chatToN,
    conversation: stores.chat.conversation,
    messages: stores.chat.messages,
    markedRead: stores.chat.markedRead,
    sticky: stores.sessions.sticky,
    removeChat: stores.sessions.removeConversation,
    loading: stores.sessions.loading,
    searching: stores.search.searching,
    event: stores.wfc.eventEmitter,
    loadConversations: stores.sessions.loadConversations,
}))
@observer
export default class Chats extends Component {
    getTheLastestMessage(userid) {
        var list = this.props.messages.get(userid);
        var res;

        if (list) {
            // Make sure all chatset has be loaded
            res = list.data.slice(-1)[0];
        }

        return res;
    }

    hasUnreadMessage(userid) {
        var list = this.props.messages.get(userid);

        if (list) {
            return list.data.length !== (list.unread || 0);
        }
    }

    showContextMenu(conversationInfo) {
        var menu = new remote.Menu.buildFromTemplate([
            {
                label: 'Send Message',
                click: () => {
                    this.props.chatTo(conversationInfo.conversation);
                }
            },
            {
                type: 'separator'
            },
            {
                label: conversationInfo.isTop ? 'Unsticky' : 'Sticky on Top',
                click: () => {
                    this.props.sticky(conversationInfo);
                }
            },
            {
                label: 'Delete',
                click: () => {
                    this.props.removeChat(conversationInfo);
                }
            },
            {
                label: 'Mark as Read',
                click: () => {
                    this.props.markedRead(conversationInfo.UserName);
                }
            },
        ]);

        menu.popup(remote.getCurrentWindow());
    }

    onSendMessage = (msg) => {
        this.props.loadConversations();
    }

    onReceiveMessage = (msg) => {
        this.props.loadConversations();
    }

    onConversationInfoUpdate = (covnersationInfo) => {
        this.props.loadConversations();
    }

    onRecallMessage = (operatorId, messageUid) => {
        this.props.loadConversations();
    }

    onDeleteMessage = (messageId) => {
        this.props.loadConversations();
    }

    onSettingUpdate = () => {
        this.props.loadConversations();
    }

    componentWillMount() {
        this.props.loadConversations();
        this.props.event.on(EventType.ReceiveMessage, this.onReceiveMessage);
        this.props.event.on(EventType.SendMessage, this.onSendMessage);
        this.props.event.on(EventType.ConversationInfoUpdate, this.onConversationInfoUpdate);
        this.props.event.on(EventType.RecallMessage, this.onRecallMessage);
        this.props.event.on(EventType.DeleteMessage, this.onRecallMessage);
        this.props.event.on(EventType.SettingUpdate, this.onSettingUpdate);
    }

    componentWillUnmount() {
        // this.props.event.removeListener(EventType.ReceiveMessage, this.onReceiveMessage);
        // this.props.event.removeListener(EventType.SendMessage, this.onSendMessage);
        // this.props.event.removeListener(EventType.ConversationInfoUpdate, this.onConversationInfoUpdate);
        // this.props.event.removeListener(EventType.RecallMessage, this.onRecallMessage);
        // this.props.event.removeListener(EventType.DeleteMessage, this.onDeleteMessage);
    }

    componentDidUpdate() {
        var container = this.refs.container;
        var active = container.querySelector(`.${classes.chat}.${classes.active}`);

        if (active) {
            let rect4active = active.getBoundingClientRect();
            let rect4viewport = container.getBoundingClientRect();

            // Keep the conversation always in the viewport
            if (!(rect4active.top >= rect4viewport.top
                && rect4active.bottom <= rect4viewport.bottom)) {
                active.scrollIntoViewIfNeeded();
            }
        }
    }

    render() {
        var { loading, chats, conversation, chatTo, searching } = this.props;


        // if (loading) return false;
        // var msg = {};
        // msg.UserName = 'imndx';
        // msg.from = 'from ';
        // msg.content = {};
        // msg.content.searchableContent = 'content';
        // chats.push(msg);

        return (
            <div className={classes.container}>
                <div
                    className={classes.chats}
                    ref="container">
                    {
                        !searching && chats.map((e, index) => {
                            // let conversationInfo = wfc.getConversationInfo(e);
                            var muted = e.isSilent;
                            var isTop = e.isTop;
                            let unreadCount = e.unreadCount;
                            let hasUnread = unreadCount.unread > 0 || unreadCount.unreadMention > 0 || unreadCount.unreadMentionAll > 0;
                            var portrait = e.portrait();
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
                                        [classes.active]: conversation && conversation.equal(e.conversation)
                                    })}
                                    // TODO key should be conversation
                                    key={index}
                                    onContextMenu={ev => this.showContextMenu(e)}
                                    onClick={ev => chatTo(e.conversation)}>
                                    <div className={classes.inner}>
                                        <div className={clazz(classes.dot, {
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
                                            e.timestamp ? moment(e.timestamp).fromNow() : ''
                                        }
                                    </span>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        );
    }

}
