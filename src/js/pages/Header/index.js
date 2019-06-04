
import React, { Component } from 'react';

import classes from './style.css';

export default class Header extends Component {
    getTitle() {
        switch (this.props.location.pathname) {
            case '/contacts':
                return '联系人';

            case '/settings':
                return '设置';

            default:
                return '野火IM';
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
