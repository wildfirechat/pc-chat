
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import React, { Component } from 'react';
import EventType from '../../../wfc/client/wfcEvent';
import ConversationItem from './conversationItem';
import classes from './style.css';
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
    reloadConversation: stores.sessions.reloadConversation,
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

    onSendMessage = (msg) => {
        // if (this.props.conversation.equal(msg.conversation)) {
        //     this.props.reloadConversation(msg.conversation);
        // }
        // this.props.reloadConversation(msg.conversation);
        this.props.loadConversations();
    }

    onReceiveMessage = (msg) => {
        // this.props.reloadConversation(msg.conversation);
        this.props.loadConversations();
    }

    onConversationInfoUpdate = (conversationInfo) => {
        // this.props.reloadConversation(conversationInfo.conversation);
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

    onConnectionStatusChange = (status) => {
        console.log('connection status loadc', status);
        if (status === 1) {
            this.props.loadConversations();
        }
    }

    onUserInfoUpdate = (userId) => {
        this.props.chats.map((c, index) => {
            if (c.conversation.conversationType === ConversationType.Single && c.conversation.target === userId) {
                this.props.reloadConversation(c.conversation);
            }
        });
    }

    onGroupInfoUpdate = (groupId) => {
        this.props.chats.map((c, index) => {
            if (c.conversation.conversationType === ConversationType.Group && c.conversation.target === groupId) {
                this.props.reloadConversation(c.conversation);
            }
        });
    }

    componentWillMount() {
        console.log('componentWillMount');
        this.props.loadConversations();
        this.props.event.on(EventType.ReceiveMessage, this.onReceiveMessage);
        this.props.event.on(EventType.SendMessage, this.onSendMessage);
        this.props.event.on(EventType.ConversationInfoUpdate, this.onConversationInfoUpdate);
        this.props.event.on(EventType.RecallMessage, this.onRecallMessage);
        this.props.event.on(EventType.DeleteMessage, this.onRecallMessage);
        this.props.event.on(EventType.SettingUpdate, this.onSettingUpdate);
        this.props.event.on(EventType.ConnectionStatusChanged, this.onConnectionStatusChange);
        this.props.event.on(EventType.UserInfoUpdate, this.onUserInfoUpdate);
        this.props.event.on(EventType.GroupInfoUpdate, this.onGroupInfoUpdate);

        setTimeout(() => {
            this.props.loadConversations();
        }, 200)
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
        var { loading, chats, conversation, chatTo, searching, markedRead, sticky, removeChat} = this.props;


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
                            return (
                                <div key={e.conversation.target}>
                                    <ConversationItem key={e.conversation.target} chatTo={chatTo} markedRead={markedRead} sticky={sticky} removeChat={removeChat} currentConversation={conversation} conversationInfo={e} />
                                </div>
                            )
                            // return <this.conversationItem key={e.conversation.target} chatTo={chatTo} currentConversation={conversation} conversationInfo={e} />
                        })
                    }
                </div>
            </div>
        );
    }

}
