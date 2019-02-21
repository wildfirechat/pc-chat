
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { remote } from 'electron';
import clazz from 'classname';
import moment from 'moment';

import classes from './style.css';
import helper from 'utils/helper';

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
    chats: stores.session.conversations,
    chatTo: stores.chat.chatTo,
    selected: stores.chat.user,
    messages: stores.chat.messages,
    markedRead: stores.chat.markedRead,
    sticky: stores.chat.sticky,
    removeChat: stores.chat.removeChat,
    loading: stores.session.loading,
    searching: stores.search.searching,
    connected:stores.session.connected,
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

    userPortrait(userId){
        return "http://img.hao661.com/qq.hao661.com/uploads/allimg/180822/0U61415T-0.jpg"
    }

    showContextMenu(user) {
        var menu = new remote.Menu.buildFromTemplate([
            {
                label: 'Send Message',
                click: () => {
                    this.props.chatTo(user);
                }
            },
            {
                type: 'separator'
            },
            {
                label: helper.isTop(user) ? 'Unsticky' : 'Sticky on Top',
                click: () => {
                    this.props.sticky(user);
                }
            },
            {
                label: 'Delete',
                click: () => {
                    this.props.removeChat(user);
                }
            },
            {
                label: 'Mark as Read',
                click: () => {
                    this.props.markedRead(user.UserName);
                }
            },
        ]);

        menu.popup(remote.getCurrentWindow());
    }

    componentDidUpdate() {
        console.log('component did update');
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
        console.log('-------------render');
        var { loading, chats, selected, chatTo, searching } = this.props;

        console.log("connected or not? ");
        console.log(this.props.connected);

        // if (loading) return false;
        // var msg = {};
        // msg.UserName = 'imndx';
        // msg.from = 'from ';
        // msg.content = {};
        // msg.content.searchableContent = 'content';
        // chats.push(msg);
        console.log("chats size", chats.length);

        return (
            <div className={classes.container}>
                <div
                    className={classes.chats}
                    ref="container">
                    {
                        !searching && chats.map((e, index) => {
                            var message = this.getTheLastestMessage(e.UserName) || {};
                            var muted = helper.isMuted(e);
                            var isTop = helper.isTop(e);

                            return (
                                <div
                                    className={clazz(classes.chat, {
                                        [classes.sticky]: isTop,
                                        [classes.active]: selected && selected.UserName === e.UserName
                                    })}
                                    key={index}
                                    onContextMenu={ev => this.showContextMenu(e)}
                                    onClick={ev => chatTo(e)}>
                                    <div className={classes.inner}>
                                        <div className={clazz(classes.dot, {
                                            [classes.green]: !muted && this.hasUnreadMessage(e.UserName),
                                            [classes.red]: muted && this.hasUnreadMessage(e.UserName)
                                        })}>
                                            <img
                                                className="disabledDrag"
                                                // TODO portrait
                                                src={this.userPortrait(e.lastMessage.from)}
                                                onError={e => (e.target.src = 'assets/images/user-fallback.png')}
                                            />
                                        </div>

                                        <div className={classes.info}>
                                            <p
                                                className={classes.username}
                                                // TODO user name
                                                dangerouslySetInnerHTML={{__html: e.lastMessage.from || e.NickName}} />

                                            <span
                                                className={classes.message}
                                                dangerouslySetInnerHTML={{__html: e.lastMessage.content.searchableContent || 'No Messagexx'}} />
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
