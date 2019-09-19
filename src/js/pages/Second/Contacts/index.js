
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import clazz from 'classname';
import randomColor from 'randomcolor';

import classes from './style.css';
import EventType from '../../../wfc/wfcEvent';
import stores from '../../../stores';

@inject(stores => ({
    filter: stores.contacts.filter,
    searching: stores.search.searching,
    filtered: stores.contacts.filtered,
    getContacts: stores.contacts.getContacts,
    showUserinfo: stores.contactInfo.toggle,
    contactItemName: stores.contacts.contactItemName,
    event: stores.wfc.eventEmitter,
}))
@observer
export default class Contacts extends Component {
    renderColumns(data, index) {
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

                        <span style={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            height: 1,
                            width: '100%',
                            background: '#eaedea',
                        }} />
                    </div>

                    <div className={classes.list}>
                        {
                            e.list.map((e, index) => {
                                return (
                                    <div
                                        className={classes.item}
                                        key={index}
                                        onClick={() => this.props.showUserinfo(true, e)}>
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

    onContactUpdate() {
        this.props.getContacts();
    }

    componentWillMount() {
        this.props.getContacts();
        // this.props.filter();
        this.props.event.on(EventType.FriendListUpdate, this.onContactUpdate);
    }

    componentWillUnmount() {
        stores.search.reset();
        this.props.event.removeListener(EventType.FriendListUpdate, this.onContactUpdate);
    }

    render() {
        var { query, result } = this.props.filtered;
        var searching = this.props.searching;

        if (query && result.length === 0) {
            return (
                <div className={clazz(classes.container, classes.notfound)}>
                    <div className={classes.inner}>
                        <img src="assets/images/crash.png" />
                        <h1>Can't find any people matching '{query}'</h1>
                    </div>
                </div>
            );
        }

        return (
            <div className={classes.container}>
                <div className={classes.contacts}
                    ref="container">
                    {
                        !searching && this.renderColumns(result, 0)
                    }
                </div>
            </div>
        );
    }
}
