import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import clazz from 'classname';
import randomColor from 'randomcolor';

import classes from './style.css';
import EventType from '../../../../wfc/client/wfcEvent';
import stores from '../../../stores';
import wfc from '../../../../wfc/client/wfc';

@inject(stores => ({
    filter: stores.contacts.filter,
    filtered: stores.contacts.filtered,
    getContacts: stores.contacts.getContacts,
    showUserinfo: async (show, user) => {
        user = wfc.getUserInfo(user.uid, true);
        stores.contactInfo.toggle(show, user);
    },
    contactItemName: stores.contacts.contactItemName,
    event: stores.wfc.eventEmitter,
    getIncommingFriendRequest: wfc.getIncommingFriendRequest,
    getUserInfo: wfc.getUserInfo,
    getMyGroupList: wfc.getMyGroupList
}))
@observer
export default class Contacts extends Component {
    state = {
        groupList: [],
        expand: false,
        newExpand: false,
        userExpand: true
    }
    renderColumns(data, index, query) {
        console.log('render c', data);
        var list = data.filter((e, i) => i % 1 === index);

        console.log('render', list.length);
        return list.map((e, index) => {
            return (
                <div
                    className={classes.group}
                    key={index}>
                    <div className={classes.header}>
                        <label>{e.prefix}</label>
                    </div>
                    <div className={classes.list}>
                        {
                            e.list.map((e, index) => {
                                return (
                                    <div
                                        className={classes.item}
                                        key={index}
                                        onClick={() => {
                                            if (query) {
                                                this.filter('')
                                            }
                                            this.props.showUserinfo(true, e)
                                        }}>
                                        <div className={classes.avatar}>
                                            <img
                                                src={this.itemPortrait(e)}
                                                style={{
                                                    height: 32,
                                                    width: 32,
                                                }} />
                                        </div>
                                        <div className={classes.info}>
                                            <p
                                                className={classes.username}
                                                dangerouslySetInnerHTML={{ __html: this.props.contactItemName(e) }} />
                                            <p
                                                className={classes.signature}
                                                dangerouslySetInnerHTML={{ __html: e.Signature || '' }} />
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            );
        });
    }

    itemPortrait(e) {
        // 由于各种的名字都是portrait
        return e.portrait;
    }

    onContactUpdate = () => {
        this.props.getContacts();
    };

    componentWillMount() {
        this.props.getContacts();
        // this.props.filter();
        this.props.event.on(EventType.FriendListUpdate, this.onContactUpdate);
        let groupList = this.props.getMyGroupList();
        this.setState({
            groupList: groupList
        });

        // console.warn('>>>>>>>>>>>>>>>>>>>>', this.state.groupList);
    }

    componentWillUnmount() {
        this.props.event.removeListener(EventType.FriendListUpdate, this.onContactUpdate);
    }

    filter(text = '') {
        text = text.trim();
        this.props.filter(text);
    }
    getAllNewFriend() {
        var addUserList = this.props.getIncommingFriendRequest();
        var userlist = addUserList.map(item => {
            var user = this.props.getUserInfo(item.target);
            user.friendMsg = item;
            return user;
        });
        stores.contactInfo.toggle(true, userlist);
    }
    changeGroup(group) {
        console.warn(group);

        stores.contactInfo.toggle(true, group);
    }
    renderGroupColumns() {
        return this.state.groupList.map((item, index) => {
            return (
                <div className={classes.groupList} onClick={() => { this.changeGroup(item); }} key={index}>
                    <img src={item.portrait}></img>
                    <span >{item.name}</span>
                </div>
            );
        });
    }
    expandIconEvent() {
        this.setState({
            expand: !this.state.expand
        });
    }
    expandNewEvent() {
        this.setState({
            newExpand: !this.state.newExpand
        });
    }
    userExpandEvent() {
        this.setState({
            userExpand: !this.state.userExpand
        });
    }
    render() {
        var { query, result } = this.props.filtered;
        var closeIcon = <svg t="1586664960550" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1668" width="32" height="32"><path d="M332.16 883.84a40.96 40.96 0 0 0 58.24 0l338.56-343.04a40.96 40.96 0 0 0 0-58.24L390.4 140.16a40.96 40.96 0 0 0-58.24 58.24L640 512l-307.84 314.24a40.96 40.96 0 0 0 0 57.6z" fill="#999999" p-id="1669"></path></svg>;

        var expandIcon = <svg t="1586664992872" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2490" width="32" height="32"><path d="M140.16 332.16a40.96 40.96 0 0 0 0 58.24l343.04 338.56a40.96 40.96 0 0 0 58.24 0l342.4-338.56a40.96 40.96 0 1 0-58.24-58.24L512 640 197.76 332.16a40.96 40.96 0 0 0-57.6 0z" fill="#999999" p-id="2491"></path></svg>;
        // TODO 未搜索到结果的ui
        // if (query && result.length === 0) {
        //     return (
        //         <div className={classes.container}>
        //             <div className={classes.searchBar}>
        //                 <i className="icon-ion-ios-search-strong"/>
        //                 <input
        //                     id="search"
        //                     onInput={e => this.filter(e.target.value)}
        //                     placeholder="搜索 ..."
        //                     ref="search"
        //                     type="text"/>
        //             </div>
        //             <p>no found</p>
        //         </div>
        //     );
        // }
        var addUserIcon = <svg t="1586007708053" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2061" width="32" height="32"><path d="M502.725485 341.333333m-188.685725 0a188.685725 188.685725 0 1 0 377.37145 0 188.685725 188.685725 0 1 0-377.37145 0Z" fill="#fa9d3b" p-id="2062"></path><path d="M718.018936 594.379517a359.290042 359.290042 0 0 0-205.769537-64.344872c-198.271988 0-359.212105 159.833409-361.004658 357.700125l-0.015588 3.335708 0.015588 3.335708h3.335708l-0.015588-3.335708 0.015588-3.335708h415.342405a187.859591 187.859591 0 0 1-31.78275-104.856577c0-97.982525 74.694919-178.538314 170.261394-187.797242l0.233811-0.015587c1.231406-0.124699 2.4784-0.233811 3.725394-0.327336l0.109112 0.077937c1.93284-0.109112 3.86568-0.187049 5.814107-0.233811l-0.264986-0.202637z" fill="#fa9d3b" p-id="2063"></path><path d="M813.2269 721.494931h-64.859256v-65.934789a35.757543 35.757543 0 1 0-71.515085 0v65.934789h-67.010321a35.757543 35.757543 0 1 0 0 71.515085h67.010321v65.934789a35.757543 35.757543 0 1 0 71.515085 0v-65.934789h64.859256a35.757543 35.757543 0 1 0 0-71.515085z" fill="#fa9d3b" p-id="2064"></path></svg>;

        return (
            <div className={classes.container}>
                <div className={classes.searchBar}>
                    <div className="searchBar-bg">
                        <i className="icon-ion-ios-search-strong seach-test" />
                        <input
                            id="search"
                            onInput={e => this.filter(e.target.value)}
                            placeholder={query ? '' : '搜索 ...'}
                            value={query ? query : ''}
                            ref="search"
                            type="text" />
                    </div>
                </div>
                <div className={classes.userListContainer}>
                    {
                        !query && (
                            <div className={classes.userList}>
                                <div className={classes.userListTitle} onClick={() => { this.expandNewEvent(); }}>
                                    {this.state.newExpand ? expandIcon : closeIcon}
                                    <span>新的朋友</span>
                                </div>
                                {
                                    this.state.newExpand && (<div className={classes.adduser} onClick={() => { this.getAllNewFriend(); }}>
                                        {addUserIcon}
                                        <span >新的朋友</span>
                                    </div>)
                                }
                            </div>
                        )
                    }
                    {
                        !query && (
                            <div className={classes.userList}>
                                <div className={classes.userListTitle} onClick={() => { this.expandIconEvent(); }}>
                                    {this.state.expand ? expandIcon : closeIcon}
                                    <span>群聊</span><i>{this.state.groupList.length}</i>
                                </div>
                                {this.state.expand && this.renderGroupColumns()}
                            </div>
                        )
                    }

                    <div className={classes.contacts}
                        ref="container">
                        {
                            <div className={classes.userList}>
                                <div className={classes.userListTitle} onClick={() => { this.userExpandEvent(); }}>
                                    {this.state.userExpand ? expandIcon : closeIcon}
                                    <span>联系人</span><i>{result.length}</i>
                                </div>
                                {this.state.userExpand && this.renderColumns(result, 0, query)}
                            </div>
                        }
                    </div>
                </div>
            </div >
        );
    }
}
