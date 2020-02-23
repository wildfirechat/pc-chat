
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import classes from './style.css';
import Switch from 'components/Switch';
import Avatar from 'components/Avatar';
import helper from 'utils/helper';
import Header from '../Header';

@inject(stores => ({
    alwaysOnTop: stores.settings.alwaysOnTop,
    setAlwaysOnTop: stores.settings.setAlwaysOnTop,
    showOnTray: stores.settings.showOnTray,
    setShowOnTray: stores.settings.setShowOnTray,
    showNotification: stores.settings.showNotification,
    setShowNotification: stores.settings.setShowNotification,
    startup: stores.settings.startup,
    setStartup: stores.settings.setStartup,
    confirmImagePaste: stores.settings.confirmImagePaste,
    setConfirmImagePaste: stores.settings.setConfirmImagePaste,
    blockRecall: stores.settings.blockRecall,
    setBlockRecall: stores.settings.setBlockRecall,
    rememberConversation: stores.settings.rememberConversation,
    setRememberConversation: stores.settings.setRememberConversation,
    showRedIcon: stores.settings.showRedIcon,
    setShowRedIcon: stores.settings.setShowRedIcon,

    user: stores.sessions.user,
    logout: stores.sessions.logout,
}))
@observer
export default class Settings extends Component {
    choiceDownloadDir() {
    }

    componentDidMount() {
    }

    render() {
        var {
            alwaysOnTop,
            setAlwaysOnTop,
            showOnTray,
            setShowOnTray,
            startup,
            setStartup,
            confirmImagePaste,
            setConfirmImagePaste,
            blockRecall,
            setBlockRecall,
            rememberConversation,
            setRememberConversation,
            user,
        } = this.props;

        return (
            <div className={classes.container}>
                <div className={classes.column}>
                    <h2>设置</h2>

                    <ul 
                    style={{
                       webkitAppRegion:'no-drag'
                    }}>
                        {
                            user && (
                                <li className={classes.user}>
                                    <Avatar src={this.props.user.User.HeadImgUrl} />
                                    <button onClick={e => this.props.logout()}>Logout</button>
                                </li>
                            )
                        }
                        <li>
                            <label htmlFor="alwaysOnTop">
                                <span>Always on Top</span>
                                <Switch
                                    checked={alwaysOnTop}
                                    id="alwaysOnTop"
                                    onChange={e => setAlwaysOnTop(e.target.checked)} />
                            </label>
                        </li>

                        <li>
                            <label htmlFor="showOnTray">
                                <span>Show on Tray</span>
                                <Switch
                                    checked={showOnTray}
                                    disabled={!helper.isOsx}
                                    id="showOnTray"
                                    onChange={e => setShowOnTray(e.target.checked)} />
                            </label>
                        </li>

                        <li>
                            <label htmlFor="confirmImagePaste">
                                <span>粘贴图片确认</span>
                                <Switch
                                    checked={confirmImagePaste}
                                    id="confirmImagePaste"
                                    onChange={e => setConfirmImagePaste(e.target.checked)} />
                            </label>
                        </li>

                        <li>
                            <label htmlFor="startup">
                                <span>开机自动启动</span>
                                <Switch
                                    checked={startup}
                                    id="startup"
                                    onChange={e => setStartup(e.target.checked)} />
                            </label>
                        </li>
                    </ul>
                </div>
                <div className={classes.column}>
                    <Header />
                    <h2></h2>
                </div>

                <div className={classes.settings} 
                    style={{
                       webkitAppRegion:'no-drag'
                    }}>
                    <a
                        className={classes.button}
                        href="mailto:imndxx@gmail.com?Subject=WildfireChat%20Feedback"
                        target="_blank">
                        发送反馈给我们
                    <i className="icon-ion-ios-email-outline" />
                    </a>

                    <a
                        className={classes.button}
                        href="https://github.com/wildfirechat/pc-chat"
                        target="_blank">
                        Fork on Github
                    <i className="icon-ion-social-github" />
                    </a>
                </div>
            </div>
        );
    }
}
