
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import clazz from 'classname';
 

import classes from './style.css';
import Home from './Home';
import Contacts from './Contacts'; 
import { inject , observer } from 'mobx-react'; 
import UserCard from '../../components/userCard'

import wfc from '../../../wfc/client/wfc'

@inject(stores => ({
    showConversation: stores.chat.showConversation
}))
@observer
export default class Footer extends Component {
    state ={
        isShowUserCard:false
    }
    showUserCard(){
        this.setState({
            isShowUserCard:!this.state.isShowUserCard
        })
    }
    render() {
        var { showConversation } = this.props;
        var pathname = this.props.location.pathname;
        var component = {
            '/': Home,
            '/contacts': Contacts
        }[pathname];

        var user = WildFireIM.config.loginUser;
        
        return (
            <footer className={clazz(classes.footer,{
                [classes.winrleft]:this.props.isMac(),
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
                            <i className="icon-ion-android-chat" />
                        </span>
                    </Link>

                    <Link
                        className="link"
                        tabIndex="-1"
                        to="/contacts">
                        <span className={clazz({
                            [classes.active]: pathname === '/contacts'
                        })}>
                            <i className="icon-ion-ios-book-outline" />
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
                    [classes.winright]:this.props.isMac()
                })}>
                    {
                        component ? React.createElement(component) : ""
                    }
                </div>
            </footer>
        );
    }
}
 
{/* */ }