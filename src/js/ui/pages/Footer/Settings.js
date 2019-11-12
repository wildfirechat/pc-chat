
import React, { Component } from 'react';

import classes from './style.css';

export default class Placeholder extends Component {
    render() {
        return (
            <div className={classes.settings}>
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
        );
    }
}
