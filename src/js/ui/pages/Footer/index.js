
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import clazz from 'classname';
 

import classes from './style.css';
import Home from './Home';
import Contacts from './Contacts'; 
import { inject , observer } from 'mobx-react'; 
import UserCard from '../../components/userCard'

import wfc from '../../../wfc/client/wfc'
import EventType from "../../../wfc/client/wfcEvent";

@inject(stores => ({
    showConversation: stores.chat.showConversation,
    unreadMessageCount: stores.sessions.unreadMessageCount
}))
@observer
export default class Footer extends Component {
    state ={
        isShowUserCard:false,
        unreadFriendRequestCount:0

    }
    showUserCard(){
        this.setState({
            isShowUserCard:!this.state.isShowUserCard
        })
    }

    onFriendRequestUpdate = ()=>{
        this.setState({
            unreadFriendRequestCount: wfc.getUnreadFriendRequestCount()
        })
    }

    componentWillMount() {
        this.onFriendRequestUpdate();
        wfc.eventEmitter.on(EventType.FriendRequestUpdate, this.onFriendRequestUpdate);
    }

    componentWillUnmount() {
        wfc.eventEmitter.removeListener(EventType.FriendRequestUpdate, this.onFriendRequestUpdate);
    }

    render() {
        var { unreadMessageCount, showConversation } = this.props;
        var pathname = this.props.location.pathname;
        var component = {
            '/': Home,
            '/contacts': Contacts
        }[pathname];

        let user = wfc.getUserInfo(wfc.getUserId());
        
        return (
            <footer className={clazz(classes.footer,{
                [classes.winrleft]:this.props.isWin(),
            })}>
                <div className={classes.user} onClick= {()=>this.showUserCard()}>
                    <img src={user.portrait}/>
                    
                </div>
                <div>
                        <UserCard showCard={this.state.isShowUserCard} 
                        user ={user} config ={{ top:60,left:50}}  isCurrentUser={false}
                        hideCard={()=>this.showUserCard()} ></UserCard>
                </div>

                <nav>
                    <Link
                        className="link"
                        tabIndex="-1"
                        to="/">
                        <span className={clazz({
                            [classes.active]: pathname === '/'
                        })}>
                            <div data-aftercontent={unreadMessageCount} className={clazz(classes.dot, {
                                [classes.red]:unreadMessageCount > 0
                            })}>
                                <i className="icon-ion-android-chat" />
                            </div>
                        </span>
                    </Link>

                    <Link
                        className="link"
                        tabIndex="-1"
                        to="/contacts">
                        <span className={clazz({
                            [classes.active]: pathname === '/contacts'
                        })}>
                            <div data-aftercontent={this.state.unreadFriendRequestCount} className={clazz(classes.dot, {
                                [classes.red]:this.state.unreadFriendRequestCount > 0
                            })}>
                                <i className="icon-ion-ios-book-outline" />
                            </div>
                        </span>
                    </Link>

                    <Link
                        className="link"
                        tabIndex="-1"
                        to="/settings">
                        <span className={clazz({
                            [classes.active]: pathname === '/settings'
                        })}>
                            <i className="icon-ion-android-settings" />
                        </span>
                    </Link>
                </nav>

                <div className={clazz(classes.right, {
                    [classes.hideConversation]: !showConversation,
                    [classes.winright]:this.props.isWin()
                })}>
                    {
                        component ? React.createElement(component) : ""
                    }
                </div>
            </footer>
        );
    }
}
