
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import classes from './style.css';
// import helper from 'utils/helper';
import GroupInfo from '../../../wfc/model/groupInfo';
// import UserInfo from '../../../wfc/model/userInfo';
import wfc from '../../../wfc/client/wfc';
import clazz from 'classname';


import UserCard from '../../components/userCard'


import {isElectron} from '../../../platform';

@inject(stores => ({
    show: stores.members.show,
    close: () => stores.members.toggle(false),
    target: stores.members.target,
    list: stores.members.list,
    search: stores.members.search,
    searching: stores.members.query,
    filtered: stores.members.filtered,
    empty: stores.chat.empty,
    conversation: stores.chat.conversation,
    sticky: stores.sessions.sticky,
    removeChat: stores.sessions.removeConversation,
    toggleConversation: stores.chat.toggleConversation,
    newChat: (alreadySelected) => stores.newchat.toggle(true,alreadySelected),
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
    addMember: () => {
        stores.members.toggle(false);
        stores.addmember.toggle(true);
    }
}))
@observer
export default class Members extends Component {
    state = {
        isTop: false,
        full:false,
        isShowUserCard:false,
        user:{},
        config:{ top:30,right:30},
        noDisturbing:false
    };

    showUserCard(user,ev){
        
        this.setState({
            isShowUserCard:!this.state.isShowUserCard,
            user:user,
            config:{ top:ev.clientY,left: (ev.clientX - 340 )}
        })
    }

    hideUserCard(){
        this.setState({
            isShowUserCard:!this.state.isShowUserCard
        })
    }

    CreateGroupChat(){
        console.warn(this.props.target);
        this.props.newChat([this.props.target.uid]);
    }


    toggleConversation(){
        this.setState({
            full: !this.state.full
        });
        this.props.toggleConversation();
    }
    removeChatItem(covnersationInfo) {
        // let covnersationInfo = wfc.getConversationInfo(this.props.conversation);
        this.props.removeChat(covnersationInfo)
    }
    setTop() {
        let covnersationInfo = wfc.getConversationInfo(this.props.conversation);
        this.props.sticky(covnersationInfo);
        // info.isTop = !(info.isTop || this.state.isTop);
        this.setState({
            isTop: !this.state.isTop
        })
    }

    setNoDisturbing(){

    }

    componentDidMount() {
        var bodyDom = document.body;
        var context= this;
        bodyDom.onclick = (e) => { 
            if (!e.target.closest('.' + classes.container) && e.target.className != classes.container) {
                if(context.state.isShowUserCard){
                    context.setState({
                        isShowUserCard:false
                    });
                }
                context.props.close();
                
            }
        } 
    }
    componentDidUpdate(prevProps, prevState) {
        let covnersationInfo = wfc.getConversationInfo(this.props.conversation);
        if(covnersationInfo.isTop !== this.state.isTop && !this.props.show){
            this.setState({
                isTop: covnersationInfo.isTop
            })
        }
       
  }
  
    render() {
        var { target, searching, list, filtered } = this.props;
        if (!this.props.show) {
            return false;
        }
        let targetName = '';
        if (target instanceof GroupInfo) {
            targetName = target.name;
        }
        let isUserInfo = target instanceof GroupInfo;
        return (
            <div className={classes.container}>
                 <UserCard showCard={this.state.isShowUserCard} 
                      user ={this.state.user} config ={this.state.config}  isCurrentUser={false}
                      hideCard={()=>this.hideUserCard(false)} ></UserCard>
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
                                !searching?( <li>
                                    <div className={classes.cover, classes.useradd} >
                                        <i className="icon-ion-android-add"
                                            onClick={e => this.props.addMember()} />
                                    </div>
                                    <span className={classes.username} >添加</span>
                                </li>):''
                            }
                           
                            {
                                (searching ? filtered : list).map((e, index) => {
                                    var pallet = e.pallet || [];
                                    var frontColor = pallet[1] || [0, 0, 0];

                                    return (
                                        <li
                                            key={index}
                                            onClick={ev => this.showUserCard(e,ev)}
                                        >
                                            <div
                                                className={classes.cover}
                                                style={{
                                                    backgroundImage: `url(${e.portrait})`,
                                                }} />
                                            <span
                                                className={classes.username}
                                                dangerouslySetInnerHTML={{ __html: wfc.getGroupMemberDisplayName(this.props.target.target, e.uid) }} />
                                        </li>
                                    );
                                })
                            }
                        </ul>

                    </div>
                        : <ul className={classes.list}>
 
                        {
                            !searching?( <li>
                                <div className={classes.cover, classes.useradd} >
                                    <i className="icon-ion-android-add"
                                        onClick={e => this.CreateGroupChat()} />
                                </div>
                                <span className={classes.username} >添加</span>
                            </li>):''
                        }
                       
                        { 
                            <li 
                                onClick={ev => this.showUserCard(target,ev)}
                            >
                                <div
                                    className={classes.cover}
                                    style={{
                                        backgroundImage: `url(${target.portrait})`,
                                    }} />
                                <span
                                    className={classes.username}
                                    dangerouslySetInnerHTML={{ __html: wfc.getGroupMemberDisplayName(this.props.target.target, target.uid) }} />
                            </li>
                        }
                    </ul>
                     

                }
                {
                    isElectron()&& (
                        <div className={classes.btns}>
                        {/* <div><button onClick={() => this.toggleConversation()}>{!this.state.full?'全屏模式':'取消全屏'}</button></div> */}
                        {/* <div><button onClick={() => this.props.empty(this.props.conversation)}>清空会话消息</button></div> */}
                        <div> 置顶/取消置顶 <br/> <button className={clazz(classes.btnauto,((this.state.isTop ) ?classes.btnactive:''))}
                             onClick={() => {this.setTop();}}><span> </span></button></div>
                        <div> 消息免打扰 <br/> <button className={clazz(classes.btnauto,((this.state.isTop ) ?classes.btnactive:''))}
                        onClick={() => {this.setTop();}}><span> </span></button></div>
                        {/* <div><button onClick={() => this.removeChatItem(covnersationInfo)}>删除会话</button></div> */}
    
                    </div>
                    )
                }
               
            </div>
        );
    }
}
