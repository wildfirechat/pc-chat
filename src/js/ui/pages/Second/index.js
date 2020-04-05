
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import clazz from 'classname';

import classes from './style.css';
import Loader from 'components/Loader';
// import ChatContent from './ChatContent';
import Contacts from './Contacts';
import ContactInfo from './ContactInfo';

import Header from '../Header';
import { WfcManager } from '../../../wfc/client/wfc';

@inject(stores => ({
    loading: stores.sessions.loading,
    showConversation: stores.chat.showConversation,
    toggleConversation: stores.chat.toggleConversation,
    showRedIcon: stores.settings.showRedIcon,
    newChat: () => stores.newchat.toggle(true),
    getMyGroupList: WfcManager.getMyGroupList
}))
@observer
export default class Second extends Component {
    componentDidMount() {
        this.props.toggleConversation(true);
    }

    render() {
        return (
            <div className={classes.container}>
                <Loader
                    fullscreen={true}
                    show={false} />
                <div className={clazz(classes.inner, {
                    [classes.hideConversation]: !this.props.showConversation
                })}>
                    <div className={classes.left}>
                        <Contacts />
                    </div>

                    <div className={classes.right}>
                        <Header location={""} />
                        <ContactInfo />
                    </div>
                </div>
            </div>
        );
    }
}
