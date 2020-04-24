import {inject, observer} from 'mobx-react';
import moment from 'moment';
import React, {Component} from 'react';
import EventType from '../../../../wfc/client/wfcEvent';
import ConversationItem from './conversationItem';
import classes from './style.css';
import ConversationType from '../../../../wfc/model/conversationType';

import scrollIntoView from 'scroll-into-view-if-needed'
import smoothScrollIntoView from 'smooth-scroll-into-view-if-needed'
import wfc from '../../../../wfc/client/wfc'
import DismissGroupNotification from "../../../../wfc/messages/notification/dismissGroupNotification";
import QuitGroupNotification from "../../../../wfc/messages/notification/quitGroupNotification";

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
    filtered: stores.sessions.filtered,
    filter: stores.sessions.filter,
    chatTo: (conversation) => {
        // reload conversation target
        if (conversation.type === ConversationType.Single) {
            wfc.getUserInfo(conversation.target, true);
        } else if (conversation.type === ConversationType.Group) {
            wfc.getGroupInfo(conversation.target, true);
            wfc.getGroupMembers(conversation.target, true);
        }

        stores.chat.chatToN(conversation);
    },
    conversation: stores.chat.conversation,
    messages: stores.chat.messages,
    markedRead: stores.sessions.clearConversationUnreadStatus,
    sticky: stores.sessions.sticky,
    removeChat: stores.sessions.removeConversation,
    loading: stores.sessions.loading,
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
        if(msg.messageContent instanceof DismissGroupNotification || msg.messageContent instanceof QuitGroupNotification){
            wfc.removeConversation(msg.conversation, true);
        }
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

    onUserInfoUpdate = (userInfos) => {
        userInfos.forEach((userInfo) => {
            let userId = userInfo.uid;
            this.props.chats.forEach((c) => {
                if (c.conversation.type === ConversationType.Single && c.conversation.target === userId) {
                    this.props.reloadConversation(c.conversation);
                }
            });
        });
    }

    onGroupInfoUpdate = (groupInfos) => {
        this.props.loadConversations();
    }

    filter(text = '') {
        text = text.trim();
        this.props.filter(text);
    }

    componentWillMount() {
        console.log('chats----------componentWillMount');
        this.props.loadConversations();
        this.props.event.on(EventType.ReceiveMessage, this.onReceiveMessage);
        this.props.event.on(EventType.SendMessage, this.onSendMessage);
        this.props.event.on(EventType.ConversationInfoUpdate, this.onConversationInfoUpdate);
        this.props.event.on(EventType.RecallMessage, this.onRecallMessage);
        this.props.event.on(EventType.DeleteMessage, this.onDeleteMessage);
        this.props.event.on(EventType.SettingUpdate, this.onSettingUpdate);
        this.props.event.on(EventType.ConnectionStatusChanged, this.onConnectionStatusChange);
        this.props.event.on(EventType.UserInfosUpdate, this.onUserInfoUpdate);
        this.props.event.on(EventType.GroupInfosUpdate, this.onGroupInfoUpdate);

        setTimeout(() => {
            this.props.loadConversations();
        }, 200)
    }

    componentWillUnmount() {
        console.log('chats -------------- componentWillUnmount');

        this.props.event.removeListener(EventType.ReceiveMessage, this.onReceiveMessage);
        this.props.event.removeListener(EventType.SendMessage, this.onSendMessage);
        this.props.event.removeListener(EventType.ConversationInfoUpdate, this.onConversationInfoUpdate);
        this.props.event.removeListener(EventType.RecallMessage, this.onRecallMessage);
        this.props.event.removeListener(EventType.DeleteMessage, this.onDeleteMessage);
        this.props.event.removeListener(EventType.SettingUpdate, this.onSettingUpdate);
        this.props.event.removeListener(EventType.ConnectionStatusChanged, this.onConnectionStatusChange);
        this.props.event.removeListener(EventType.UserInfosUpdate, this.onUserInfoUpdate);
        this.props.event.removeListener(EventType.GroupInfosUpdate, this.onGroupInfoUpdate);
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
                const scrollIntoViewSmoothly =
                    'scrollBehavior' in document.documentElement.style
                        ? scrollIntoView
                        : smoothScrollIntoView
                scrollIntoViewSmoothly(active, {behavior: 'smooth'})
            }
        }
    }

    render() {
        var {chats, filtered, conversation, chatTo, markedRead, sticky, removeChat} = this.props;
        if (filtered.query) {
            chats = filtered.result;
        }
        let chatToEx = (c) => {
            if (filtered.query) {
                this.filter('');
            }
            chatTo(c);
        };

        return (
            <div className={classes.container}>
                <div className={classes.searchBar}>
                    <i className="icon-ion-ios-search-strong"/>
                    <input
                        id="search"
                        // onFocus={e => this.filter(e.target.value)}
                        onInput={e => this.filter(e.target.value)}
                        // onKeyUp={e => this.navigation(e)}
                        placeholder={filtered.query ? '' : '搜索 ...'}
                        value={filtered.query ? filtered.query : ''}
                        ref="search"
                        type="text"/>
                </div>
                <div
                    className={classes.chats}
                    ref="container">
                    {
                        chats.map((e, index) => {
                            return (
                                <div key={e.conversation.type + e.conversation.target + e.conversation.line}>
                                    <ConversationItem
                                        key={e.conversation.target + e.conversation.type + e.conversation.line}
                                        chatTo={chatToEx} markedRead={markedRead} sticky={sticky}
                                        removeChat={removeChat}
                                        currentConversation={conversation} conversationInfo={e}
                                        isSearching={!!filtered.query}
                                    />
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
