
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import classes from './style.css';
import UserInfo from '../../../wfc/model/userInfo';
import GroupInfo from '../../../wfc/model/groupInfo';
import Conversation from '../../../wfc/model/conversation';
import ConversationType from '../../../wfc/model/conversationType';
import wfc from '../../../wfc/client/wfc';

@inject(stores => ({
    history: stores.search.history,
    searching: stores.search.searching,
    toggle: stores.search.toggle,
    filter: stores.search.filter,
    result: stores.search.result,
    getPlaceholder: () => {
        stores.contacts.filter('', true);
        return stores.contacts.filtered.result;
    },
    // chat: async (target) => {
    //     var conversation;
    //     if (target instanceof UserInfo) {
    //         conversation = new Conversation(ConversationType.Single, target.uid, 0);
    //     } else if (target instanceof GroupInfo) {
    //         conversation = new Conversation(ConversationType.Group, target.target, 0);
    //     }
    //     stores.chat.chatToN(conversation);
    //     stores.search.reset();
    //     // await stores.search.addHistory(target);
    // },
    showUserinfo: async (user) => {
        user = wfc.getUserInfo(user.uid, true);
        stores.contactInfo.toggle(true, user);
        stores.search.reset();
    },
    clear: (e) => {
        e.preventDefault();
        e.stopPropagation();

        stores.search.clearHistory();
        stores.search.reset();
    },
    contactName: stores.contacts.contactItemName,
}))
@observer
export default class SearchBar extends Component {
    timer;

    filter(text = '') {
        text = text.trim();

        clearTimeout(this.filter.timer);
        this.filter.timer = setTimeout(() => {
            this.props.filter(text);
        }, 300);
    }

    handleBlur(value) {
        clearTimeout(this.handleBlur.timer);
        this.handleBlur.timer = setTimeout(() => {
            if (!value) {
                this.props.toggle(false);
            }
        }, 500);
    }

    componentWillUnmount() {
        if(this.filter.timer){
            clearTimeout(this.filter.timer);
        }
        if(this.handleBlur.timer){
            clearTimeout(this.handleBlur.timer);
        }
    }

    chatTo(target) {
        this.props.showUserinfo(target);
        this.refs.search.value = '';
        // document.querySelector('#messageInput').focus();
    }

    highlight(offset) {
        var scroller = this.refs.dropdown;
        var users = Array.from(scroller.querySelectorAll(`.${classes.user}`));
        var index = users.findIndex(e => e.classList.contains(classes.active));

        if (index > -1) {
            users[index].classList.remove(classes.active);
        }

        index += offset;

        if (index < 0) {
            // Fallback to the last element
            index = users.length - 1;
        } else if (index > users.length - 1) {
            // Fallback to the 1th element
            index = 0;
        }

        var active = users[index];

        if (active) {
            // Keep active item always in the viewport
            active.classList.add(classes.active);
            scroller.scrollTop = active.offsetTop + active.offsetHeight - scroller.offsetHeight;
        }
    }

    navigation(e) {
        var { result, history, getPlaceholder } = this.props;

        // User press ESC
        if (e.keyCode === 27) {
            e.target.blur();
        }

        if (![
            38, // Up
            40, // Down
            13, // Enter
        ].includes(e.keyCode)) {
            return;
        }

        switch (e.keyCode) {
            case 38:
                // Up
                this.highlight(-1);
                break;

            case 40:
                // Down
                this.highlight(1);
                break;

            case 13:
                let active = this.refs.dropdown.querySelector(`.${classes.user}.${classes.active}`);

                if (!active) {
                    break;
                }
                let items = [...result.friend, ...result.groups];
                if (items.length <= 0) {
                    getPlaceholder().map(e => {
                        e.list.map(a => {
                            items.push(a);
                        });
                    });
                }

                this.chatTo(items.find(e => {
                    if (e instanceof UserInfo) {
                        return e.uid === active.dataset.userid;
                    } else if (e instanceof GroupInfo) {
                        return e.target === active.dataset.userid;
                    }
                    return false;
                }));
        }
    }

    renderItem(item) {
        let name = this.props.contactName(item);
        var uid;
        if (item instanceof UserInfo) {
            uid = item.uid;
        } else if (item instanceof GroupInfo) {
            uid = item.target;
        }
        return (
            <div
                className={classes.user}
                onClick={e => this.chatTo(item)} data-userid={uid}>
                <img src={item.portrait} />

                <div className={classes.info}>
                    <p
                        className={classes.username}
                        dangerouslySetInnerHTML={{ __html: name }} />

                    <span
                        className={classes.signature}
                        dangerouslySetInnerHTML={{ __html: item.Signature || '' }} />
                </div>
            </div>
        );
    }

    renderList(list, title) {
        if (!list.length) return false;

        return (
            <div>
                <header>
                    <h3>{title}</h3>
                </header>
                {
                    list.map((e, index) => {
                        return (
                            <div key={index}>
                                {this.renderItem(e)}
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    renderHistory(list) {
        return (
            <div>
                <header>
                    <h3>History</h3>

                    <a
                        href=""
                        onClick={e => this.props.clear(e)}>
                        CLEAR
                    </a>
                </header>
                {
                    list.map((e, index) => {
                        return (
                            <div key={index}>
                                {this.renderItem(e)}
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    renderPlaceholder() {
        var list = this.props.getPlaceholder();

        return list.map((e, index) => {
            return (
                <div key={index}>
                    {this.renderList(e.list, e.prefix)}
                </div>
            );
        });
    }

    render() {
        var { searching, history, result } = this.props;

        return (
            <div className={classes.container}>
                <i className="icon-ion-ios-search-strong" />
                <input
                    id="search"
                    onBlur={e => this.handleBlur(e.target.value)}
                    onFocus={e => this.filter(e.target.value)}
                    onInput={e => this.filter(e.target.value)}
                    onKeyUp={e => this.navigation(e)}
                    placeholder="搜索 ..."
                    ref="search"
                    type="text" />
                {
                    searching && (
                        <div
                            className={classes.dropdown}
                            ref="dropdown">
                            {
                                !result.query && (history.length ? this.renderHistory(history) : this.renderPlaceholder())
                            }

                            {this.renderList(result.friend, 'Friend')}
                            {this.renderList(result.groups, 'Group')}
                        </div>
                    )
                }
            </div>
        );
    }
}
