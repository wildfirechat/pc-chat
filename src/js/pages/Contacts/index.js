
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import clazz from 'classname';
import randomColor from 'randomcolor';

import classes from './style.css';

@inject(stores => ({
    filter: stores.contacts.filter,
    filtered: stores.contacts.filtered,
    getContacts: stores.contacts.getContacts,
    showUserinfo: stores.userinfo.toggle,
    contactItemName: stores.contacts.contactItemName,
}))
@observer
export default class Contacts extends Component {
    renderColumns(data, index) {
        console.log('render c', data);
        var list = data.filter((e, i) => i % 3 === index);

        console.log('render', list.length);
        return list.map((e, index) => {
            return (
                <div
                    className={classes.group}
                    key={index}>
                    <div className={classes.header}>
                        <label>{e.prefix}</label>

                        <span>{e.list.length} people</span>
                        <span style={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            height: 4,
                            width: '100%',
                            background: randomColor(),
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
                                                dangerouslySetInnerHTML={{ __html: e.Signature || 'No Signature' }} />
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

    componentWillMount() {
        this.props.getContacts();
        // this.props.filter();
    }

    render() {
        var { query, result } = this.props.filtered;

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
                <div className={classes.columns}>
                    <div className={classes.column}>
                        {
                            this.renderColumns(result, 0)
                        }
                    </div>
                    <div className={classes.column}>
                        {
                            this.renderColumns(result, 1)
                        }
                    </div>
                    <div className={classes.column}>
                        {
                            this.renderColumns(result, 2)
                        }
                    </div>
                </div>
            </div>
        );
    }
}
