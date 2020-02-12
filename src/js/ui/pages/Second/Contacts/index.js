import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import clazz from 'classname';
import randomColor from 'randomcolor';

import classes from './style.css';
import EventType from '../../../../wfc/client/wfcEvent';
import stores from '../../../stores';
import wfc from '../../../../wfc/client/wfc';

@inject(stores => ({
    filter: stores.contacts.filter,
    filtered: stores.contacts.filtered,
    getContacts: stores.contacts.getContacts,
    showUserinfo: async (show, user) => {
        user = wfc.getUserInfo(user.uid, true);
        stores.contactInfo.toggle(show, user);
    },
    contactItemName: stores.contacts.contactItemName,
    event: stores.wfc.eventEmitter,
}))
@observer
export default class Contacts extends Component {
    renderColumns(data, index, query) {
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
                        }}/>
                    </div>

                    <div className={classes.list}>
                        {
                            e.list.map((e, index) => {
                                return (
                                    <div
                                        className={classes.item}
                                        key={index}
                                        onClick={() => {
                                            if (query) {
                                                this.filter('')
                                            }
                                            this.props.showUserinfo(true, e)
                                        }}>
                                        <div className={classes.avatar}>
                                            <img
                                                src={this.itemPortrait(e)}
                                                style={{
                                                    height: 32,
                                                    width: 32,
                                                }}/>
                                        </div>
                                        <div className={classes.info}>
                                            <p
                                                className={classes.username}
                                                dangerouslySetInnerHTML={{__html: this.props.contactItemName(e)}}/>
                                            <p
                                                className={classes.signature}
                                                dangerouslySetInnerHTML={{__html: e.Signature || ''}}/>
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

    onContactUpdate = () => {
        this.props.getContacts();
    };

    componentWillMount() {
        this.props.getContacts();
        // this.props.filter();
        this.props.event.on(EventType.FriendListUpdate, this.onContactUpdate);
    }

    componentWillUnmount() {
        this.props.event.removeListener(EventType.FriendListUpdate, this.onContactUpdate);
    }

    filter(text = '') {
        text = text.trim();
        this.props.filter(text);
    }

    render() {
        var {query, result} = this.props.filtered;

        // TODO 未搜索到结果的ui
        // if (query && result.length === 0) {
        //     return (
        //         <div className={classes.container}>
        //             <div className={classes.searchBar}>
        //                 <i className="icon-ion-ios-search-strong"/>
        //                 <input
        //                     id="search"
        //                     onInput={e => this.filter(e.target.value)}
        //                     placeholder="搜索 ..."
        //                     ref="search"
        //                     type="text"/>
        //             </div>
        //             <p>no found</p>
        //         </div>
        //     );
        // }

        return (
            <div className={classes.container}>
                <div className={classes.searchBar}>
                    <i className="icon-ion-ios-search-strong"/>
                    <input
                        id="search"
                        onInput={e => this.filter(e.target.value)}
                        placeholder={query ? '' : '搜索 ...'}
                        value={query ? query : ''}
                        ref="search"
                        type="text"/>
                </div>
                <div className={classes.contacts}
                     ref="container">
                    {
                        this.renderColumns(result, 0, query)
                    }
                </div>
            </div>
        );
    }
}
