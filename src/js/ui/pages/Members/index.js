
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import classes from './style.css';
// import helper from 'utils/helper';
import GroupInfo from '../../../wfc/model/groupInfo';
// import UserInfo from '../../../wfc/model/userInfo';
import wfc from '../../../wfc/client/wfc';
import clazz from 'classname';

import Config from '../../../config';
import UserCard from '../../components/userCard';
import UserInfo from '../../../wfc/model/userInfo';
import ConversationInfo from '../../../wfc/model/conversationInfo';

import axios from 'axios';

import MessageConfig from '../../../wfc/client/messageConfig';

@inject(stores => ({
    show: stores.members.show,
    close: () => stores.members.toggle(false),
    showMembers: () => stores.members.toggle(true, stores.members.target),
    target: stores.members.target,
    list: stores.members.list,
    groupNotice: stores.members.groupNotice,
    search: stores.members.search,
    searching: stores.members.query,
    filtered: stores.members.filtered,
    empty: stores.chat.empty,
    conversation: stores.chat.conversation,
    conversationInfo: stores.chat.conversationInfo,
    sticky: stores.sessions.sticky,
    removeChat: stores.sessions.removeConversation,
    toggleConversation: stores.chat.toggleConversation,
    newChat: (alreadySelected) => stores.newchat.toggle(true, alreadySelected),
    showUserinfo: async (user) => {
        var caniremove = false;
        if (stores.chat.target instanceof GroupInfo) {
            let groupInfo = stores.chat.target;
            if (groupInfo.owner === wfc.getUserId()) {
                caniremove = true;
            }
        }

        wfc.getUserInfo(user.uid, true);
        stores.userinfo.toggle(true, stores.chat.conversation, user, caniremove);
    },
    modifyGroupInfo: async (name) => {
        // var caniremove = false;
        if (stores.chat.target instanceof GroupInfo) {
            let groupInfo = stores.chat.target;
            wfc.modifyGroupInfo(groupInfo.target, 0, name, [0], null, (e) => {
                console.warn(e);
            }, (e) => {
                console.warn(e);
            })
        }
    },
    modifyGroupAlias: async (name, callback) => {
        // var caniremove = false;
        if (stores.chat.target instanceof GroupInfo) {
            let groupInfo = stores.chat.target;
            let contentClazz = MessageConfig.getMessageContentClazz('ModifyGroupAliasNotification');
            // new contentClazz(wfc.getUserId(), name)
            wfc.modifyGroupAlias(groupInfo.target, name, [0],
                null, (e) => {
                    console.warn(e);
                    //TODO  需更新列表数据
                    callback(true);
                }, (e) => {
                    console.warn(e);
                });
        }

        // wfc.getUserInfo(user.uid, true);
        // stores.userinfo.toggle(true, stores.chat.conversation, user, caniremove);
    },
    quitGroup: async () => {
        wfc.quitGroup(stores.chat.target.target, [0], null, (e) => {

        }, (e) => {
            console.warn(e);
        })
    },
    addMember: () => {
        stores.members.toggle(false);
        stores.addmember.toggle(true);
    },
    saveIntoList: (blo, callback) => {
        wfc.setFavGroup(stores.chat.target.target, !stores.members.isFavGroup, (e) => {
            stores.members.changeIsFavGroup(!stores.members.isFavGroup);
        });
    },
    setUserSetting: () => {
        wfc.setUserSetting(5, stores.chat.target.target, !stores.members.showUserName ? '1' : '0', (e) => {
            // callback(!blo);
            stores.members.changeShowUserName(!stores.members.showUserName);
        }, (e) => {
        });
    },
    isMyFriend: wfc.isMyFriend,
    isFavGroup: stores.members.isFavGroup,
    showUserName: stores.members.showUserName,
    setFavGroup: wfc.setFavGroup,
    slient: async (info) => {
        stores.sessions.slient(info, (e) => {
            console.warn('>>>>>>>>>>>>>', e);
            stores.chat.changeConversationInfo(stores.chat.conversation);
        });
    }
}))
@observer
export default class Members extends Component {
    state = {
        isTop: false,
        isSlient: false,
        full: false,
        isShowUserCard: false,
        user: {},
        config: { top: 30, right: 30 },
        noDisturbing: false,
        userdisNames: {},
        target: {},
        showSize: 8
    };

    showUserCard(user, ev) {
        var isMyFriend = this.props.isMyFriend(user.uid) || user.uid === WildFireIM.config.loginUser.uid;
        this.setState({
            isShowUserCard: !this.state.isShowUserCard,
            user: user,
            config: { top: ev.clientY, left: (ev.clientX - 340) },
            isMyFriend: isMyFriend
        });
    }

    hideUserCard() {
        this.setState({
            isShowUserCard: !this.state.isShowUserCard
        });
    }
    getDisName(uid) {
        var disName = WildFireIM.cache[this.props.target.target] || {};
        if (!disName[uid]) {
            disName[uid] = wfc.getGroupMemberDisplayName(this.props.target.target, uid)
            WildFireIM.cache[this.props.target.target] = disName;
        }
        return disName[uid];
    }
    CreateGroupChat() {
        // console.warn(this.props.target);
        var id = WildFireIM.config.loginUser.uid !== this.props.target.uid ? this.props.target.uid : "";
        this.props.newChat([id]);
    }
    changeShowUser() {
        this.setState({
            showSize: 0
        });
    }
    changeEditeMessage(e, type) {
        var tagName = e.target.tagName;
        if (tagName === 'svg' || tagName === 'path') {
            var sp = tagName === 'path' ? e.target.parentNode.previousSibling : e.target.previousSibling;
            sp.setAttribute('contenteditable', true);
            sp.style.background = '#fff';
            sp.style.outline = 'none';
            sp.setAttribute('tabindex', 0);
            sp.onkeydown = (e) => { this.keyTagName(e, type) }
            sp.focus();
        }
    }
    keyTagName(e, type) {
        if (e.keyCode === 13) {
            e.target.blur();
        }
    }
    changeTagName(e, type) {
        e.target.setAttribute('contenteditable', false);
        e.target.style.background = 'inherit';
        // console.warn(e.target.innerText)
        var val = e.target.innerText;
        if (type == 'name') {
            this.props.modifyGroupInfo(val);
        } else if (type == 'disName') {
            this.props.modifyGroupAlias(val, (key) => {
                let disName = WildFireIM.cache[this.props.target.target];
                disName[wfc.getUserId()] = val;
                WildFireIM.cache[this.props.target.target] = disName;
            });
        } else {
            axios.defaults.baseURL = Config.APP_SERVER;
            this.getGroupNotice(val);
        }

    }
    deleteBtn() {
        this.props.quitGroup();
    }
    async getGroupNotice(text) {
        var response = await axios.post('/put_group_announcement', {
            author: wfc.getUserId(),
            groupId: this.props.target.target,
            text: text
        });
        if (response.data) {
            console.warn(response.data);
        }
    }

    toggleConversation() {
        this.setState({
            full: !this.state.full
        });
        this.props.toggleConversation();
    }
    removeChatItem(covnersationInfo) {
        // let covnersationInfo = wfc.getConversationInfo(this.props.conversation);
        this.props.removeChat(covnersationInfo);
    }
    setTop() {
        let covnersationInfo = wfc.getConversationInfo(this.props.conversation);
        this.props.sticky(covnersationInfo);
        this.setState({
            isTop: !this.state.isTop
        });
    }
    showName() {

    }
    // saveIntoList() {
    //     this.props.setFavGroup(this.props.target.target, !this.props.isFavGroup, (e) => {
    //         stores.members.changeIsFavGroup(!stores.members.isFavGroup);
    //     });
    // }
    noDisturbing() {
        // TODO 此处代码调用会导致界面卡死
        let covnersationInfo = wfc.getConversationInfo(this.props.conversation);
        covnersationInfo.isSilent = !covnersationInfo.isSilent;
        this.props.slient(covnersationInfo);
    }
    componentDidMount() {
        var bodyDom = document.body;
        var context = this;
        bodyDom.onclick = (e) => {
            if (this.props.show && !e.target.closest('.' + classes.container) && e.target.className != classes.container && !e.target.closest('.src-js-ui-pages-Home-ChatContent-style__signature--2qCXq')) {
                if (context.state.isShowUserCard) {
                    context.setState({
                        isShowUserCard: false
                    });
                }
                setTimeout(() => {
                    context.props.close();
                }, 200);
            }
        }
    }
    componentDidUpdate(prevProps, prevState) {
        let covnersationInfo = wfc.getConversationInfo(this.props.conversation);
        if (covnersationInfo && covnersationInfo.isTop !== this.state.isTop && !this.props.show) {
            this.setState({
                isTop: covnersationInfo.isTop
            });
        }
        // if (covnersationInfo.isSlient !== this.state.isSlient && !this.props.show) {
        //     this.setState({
        //         isSlient: covnersationInfo.isSlient
        //     });
        // }
        if (prevProps.target instanceof GroupInfo && this.state.show !== this.props.show) {
            this.setState({
                show: this.props.show
            });
        }


        if (((prevProps.target instanceof GroupInfo && prevProps.target.target !== this.state.target.target) ||
            (prevProps.target instanceof UserInfo && prevProps.target.uid !== this.state.target.uid)
        ) && !this.props.show) {
            this.setState({
                target: prevProps.target,
                showSize: 10
            });
        }
    }

    render() {
        var { target, searching, list, filtered } = this.props;
        var editIcon = <svg t="1584766598709" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2796" width="16" height="16"><path d="M883.65056 861.20448H510.8224c-20.19328 0-36.24448 15.68768-36.24448 35.42528 0 19.7376 16.0512 35.42528 36.24448 35.42528h372.82816c20.19328 0 36.2496-15.68768 36.2496-35.42528-0.00512-19.7376-16.05632-35.42528-36.2496-35.42528zM613.97504 224.384c-8.82176 0-19.52768 4.9152-28.53376 13.91616-13.952 13.95712-18.08384 32.01536-9.3184 40.77568l161.77152 161.77152c3.10784 3.10784 7.38816 4.59776 12.24192 4.59776 8.82176 0 19.52768-4.9152 28.53376-13.91616 13.95712-13.95712 18.08384-32.01536 9.3184-40.77568l-161.77152-161.77152c-3.11296-3.10784-7.38816-4.59776-12.24192-4.59776z" fill="#dadada" p-id="2797"></path><path d="M753.26976 143.08352l129.13152 129.13152L365.9776 788.63872l-206.93504 75.48416 77.47072-204.288L753.26976 143.08352m0-75.03872a60.53376 60.53376 0 0 0-42.94144 17.78688L184.8832 611.28192a60.7232 60.7232 0 0 0-13.83936 21.40672l-101.76 268.33408c-10.49088 27.66336 10.89536 54.92736 37.63712 54.92736 4.5824 0 9.32864-0.80384 14.09024-2.53952l271.34976-98.98496a60.7232 60.7232 0 0 0 22.12864-14.11072l525.16352-525.1584c23.71584-23.71584 23.71584-62.16192 0-85.87776L796.2112 85.83168a60.544 60.544 0 0 0-42.94144-17.78688z" fill="#dadada" p-id="2798"></path></svg>;
        if (!this.props.show) {
            return false;
        }
        let targetName = '';
        if (target instanceof GroupInfo) {
            targetName = target.name;
        }
        let isUserInfo = target instanceof GroupInfo;
        let _style = isUserInfo ? '' : 'calc(100vh - 65px)';
        return (
            <div className={classes.container} style={{ height: _style }}>
                <UserCard showCard={this.state.isShowUserCard}
                    user={this.state.user} config={this.state.config} isCurrentUser={!this.state.isMyFriend}
                    hideCard={() => this.hideUserCard(false)} addUserEvent={() => { this.props.close() }}></UserCard>
                {
                    (isUserInfo) ? <div>
                        <header>
                            <div className={classes.footer}>
                                <i class="icon-ion-ios-search-strong"></i>
                                <input
                                    autoFocus={true}
                                    id="messageInput"
                                    maxLength={30}
                                    onInput={e => this.props.search(e.target.value)}
                                    placeholder="输入内容开始搜索 ..."
                                    ref="input"
                                    type="text" />
                            </div>
                            {/* <span dangerouslySetInnerHTML={{ __html: `群组 '${targetName}' 拥有 ${list.length} 位成员` }} /> */}

                            <span>

                                {/* 
                           <i
                               className="icon-ion-android-close"
                               onClick={e => this.props.close()} /> */}
                            </span>
                        </header>

                        <ul className={classes.list}>

                            {
                                (searching && filtered.length === 0) && (
                                    <div className={classes.notfound}>
                                        <img src="assets/images/crash.png" />
                                        <h3>Can't find any people matching '{searching}'</h3>
                                    </div>
                                )
                            }
                            {
                                !searching ? (<li>
                                    <div className={classes.cover, classes.useradd} >
                                        <i className="icon-ion-android-add"
                                            onClick={e => this.props.addMember()} />
                                    </div>
                                    <span className={classes.username} >添加</span>
                                </li>) : ''
                            }

                            {
                                (searching ? filtered : list).map((e, index) => {
                                    var pallet = e.pallet || [];
                                    var frontColor = pallet[1] || [0, 0, 0];
                                    if (index > this.state.showSize && this.state.showSize != 0) {
                                        return;
                                    }

                                    // console.warn("EndTime:", +new Date())
                                    return (
                                        <li
                                            key={index}
                                            onClick={ev => this.showUserCard(e, ev)}
                                        >
                                            <div
                                                className={classes.cover}
                                                style={{
                                                    backgroundImage: `url(${e.portrait})`,
                                                }} />
                                            <span
                                                className={classes.username} >{this.getDisName(e.uid)}</span>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                        {
                            this.state.showSize === 0 || list.length < 11 ? '' : <div className={classes.searchall} onClick={e => { this.changeShowUser() }}>
                                查看更多成员
                               <svg t="1584625243832" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1883" width="32" height="18"><path d="M511.1 512.9l1.8-1.8-1.8 1.8z" fill="#8a8a8a" p-id="1884"></path><path d="M510.9 510.9l2.2 2.2c-0.7-0.8-1.4-1.5-2.2-2.2z" fill="#8a8a8a" p-id="1885"></path><path d="M512.1 648.1c8.3 0 15.8-3.1 21.5-8.3l2.2-2.2 21.5-21.5L743 430.4c12.4-12.4 12.4-32.8 0-45.3-12.4-12.4-32.8-12.4-45.3 0L512 570.9 326.2 385.2c-12.4-12.4-32.8-12.4-45.3 0-12.4 12.4-12.4 32.8 0.1 45.2l185.7 185.7 21.8 21.8 1.8 1.8c5.7 5.3 13.4 8.5 21.8 8.4z" fill="#8a8a8a" p-id="1886"></path><path d="M512.9 511.1l-1.8 1.8 1.8-1.8z" fill="#8a8a8a" p-id="1887"></path><path d="M513.1 513.1l-2.2-2.2c0.7 0.8 1.4 1.5 2.2 2.2z" fill="#8a8a8a" p-id="1888"></path></svg>
                            </div>
                        }
                    </div>
                        : <ul className={classes.list}>

                            {
                                !searching ? (<li>
                                    <div className={classes.cover, classes.useradd} >
                                        <i className="icon-ion-android-add"
                                            onClick={e => this.CreateGroupChat()} />
                                    </div>
                                    <span className={classes.username} >添加</span>
                                </li>) : ''
                            }

                            {
                                <li
                                    onClick={ev => this.showUserCard(target, ev)}
                                >
                                    <div
                                        className={classes.cover}
                                        style={{
                                            backgroundImage: `url(${target.pallet})`,
                                        }} />
                                    <span
                                        className={classes.username}
                                        dangerouslySetInnerHTML={{ __html: wfc.getGroupMemberDisplayName(this.props.target.target, target.uid) }} />
                                </li>
                            }
                        </ul>


                }
                {
                        <div className={classes.btns}>
                            {isUserInfo && (<div>
                                <div className={classes.editbtn}> 群名称 <br />
                                    <div onClick={(e) => {
                                        this.changeEditeMessage(e, 'name');
                                    }}>
                                        <span dangerouslySetInnerHTML={{ __html: target.name }} onBlur={(e) => { this.changeTagName(e, 'name') }} />
                                        {editIcon}
                                    </div>
                                </div>
                                <div className={classes.editbtn}> 群公告 <br />
                                    <div onClick={(e) => {
                                        this.changeEditeMessage(e, 'groupNotice');
                                    }} >
                                        <span dangerouslySetInnerHTML={{ __html: this.props.groupNotice }} onBlur={(e) => { this.changeTagName(e, 'groupNotice') }} />
                                        {editIcon}
                                    </div>
                                </div>
                                <div className={classes.editbtn} > 我在本群的名称 <br />
                                    <div onClick={(e) => {
                                        this.changeEditeMessage(e, 'disName');
                                    }} >
                                        <span dangerouslySetInnerHTML={{ __html: wfc.getGroupMemberDisplayName(this.props.target.target, WildFireIM.config.loginUser.uid) }}
                                            onBlur={(e) => { this.changeTagName(e, 'disName') }}
                                        />
                                        {editIcon}
                                    </div>
                                </div>
                                <div> 显示群昵称 <br /> <button className={clazz(classes.btnauto, ((this.props.showUserName) ? classes.btnactive : ''))}
                                    onClick={() => { this.props.setUserSetting(); }}><span> </span></button></div>
                                <div> 保存到通讯录 <br /> <button className={clazz(classes.btnauto, ((this.props.isFavGroup) ? classes.btnactive : ''))}
                                    onClick={() => { this.props.saveIntoList(); }}><span> </span></button></div>
                            </div>)}
                            <div> 置顶/取消置顶 <br /> <button className={clazz(classes.btnauto, ((this.state.isTop) ? classes.btnactive : ''))}
                                onClick={() => { this.setTop(); }}><span> </span></button></div>
                            <div> 消息免打扰 <br /> <button className={clazz(classes.btnauto, ((this.props.conversationInfo.isSilent) ? classes.btnactive : ''))}
                                onClick={() => { this.noDisturbing(); }}><span> </span></button></div>
                        </div>

                    }


                {
                    isUserInfo && (<div className={classes.deleteBtn} onClick={() => { this.deleteBtn(); }}> 删除并退出</div>)
                }
            </div>
        );
    }
}
