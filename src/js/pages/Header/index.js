
import React, { Component } from 'react';

import classes from './style.css';

export default class Header extends Component {
    getTitle() {
        switch (this.props.location.pathname) {
            case '/contacts':
                return 'Contacts - WildfireChat';

            case '/settings':
                return 'Settings - WildfireChat';

            default:
                return 'WildfireChat';
        }
    }

    render() {
        return (
            <header className={classes.container}>
                <h1>{this.getTitle()}</h1>
            </header>
        );
    }
}
