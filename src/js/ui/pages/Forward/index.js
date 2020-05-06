
import React, { Component } from 'react';
import { Modal, ModalBody } from 'components/Modal';
import { inject, observer } from 'mobx-react';

import classes from './style.css';
import UserList from 'components/UserList';
import wfc from '../../../wfc/client/wfc'
import UserInfo from '../../../wfc/model/userInfo';

@inject(stores => ({
    show: stores.forward.show,
    searching: stores.forward.query,
    getList: () => {
        var { forward, contacts } = stores;

        if (forward.query) {
            return forward.list;
        }

        if (contacts.memberList.length === 0) {
            contacts.getContacts();
        }
        return contacts.memberList.filter(e => {
            if (e instanceof UserInfo) {
                return e.uid !== wfc.getUserId()
            }
            return true;
        });
    },
    getUser: (userid) => {
        return stores.contacts.memberList.find(e => e.uid === userid);
    },
    search: stores.forward.search,
    send: (userids) => stores.forward.send(userids),
    close: () => stores.forward.toggle(false),
}))
@observer
export default class Forward extends Component {
    state = {
        selected: [],
    };

    close() {
        this.props.close();
        this.setState({
            selected: [],
        });
    }

    send(userids) {
        userids.map(e => {
            this.props.send(e);
        });
        this.close();
    }

    renderList() {
        var self = this;
        var { show, searching, search, getList } = this.props;

        if (!show) {
            return false;
        }

        return (
            <UserList {...{
                ref: 'users',

                search,
                getList,
                searching,
                max: -1,

                onChange(selected) {
                    self.setState({
                        selected,
                    });
                }
            }} />
        );
    }

    render() {
        return (
            <Modal
                fullscreen={true}
                onCancel={e => this.close()}
                show={this.props.show}>
                <ModalBody className={classes.container}>
                    <i className={classes.close} onClick={e => this.close()}>
                        <svg t="1582438315901" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1996" width="15" height="15"><path d="M810.666667 273.493333L750.506667 213.333333 512 451.84 273.493333 213.333333 213.333333 273.493333 451.84 512 213.333333 750.506667 273.493333 810.666667 512 572.16 750.506667 810.666667 810.666667 750.506667 572.16 512z" p-id="1997" fill="#616161"></path></svg>
                    </i>
                    <div className={classes.avatars}>
                        <div className={classes.title}>分别转发给：<span className={classes.little}>已选择{this.state.selected.length}个聊天</span></div>
                        <ul>
                            {
                                this.state.selected.map((e, index) => {
                                    var user = this.props.getUser(e);
                                    return (
                                        <li>
                                            <img
                                                key={index}
                                                onClick={ev => this.refs.users.removeSelected(e)}
                                                src={user.portrait} />
                                            <span >{user.displayName}</span>
                                            <i onClick={ev => this.refs.users.removeSelected(e)}><svg t="1582979647664" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2284" width="30" height="30"><path d="M714.8 309.1c-111.7-112.2-293.4-112.2-405.6 0C197 421.3 197 603 309.2 714.7c112.2 112.3 293.9 112.3 405.6 0C827 603 827 421.3 714.8 309.1z m-36.9 338.3c8.1 8.1 8.1 21.7 0 30.4-8.7 8.2-22.2 8.2-30.4 0L512.2 542.5 376.9 677.8c-8.7 8.2-22.2 8.2-30.4 0-8.7-8.7-8.7-22.2 0-30.4l135.3-135.3-135.2-135.2c-8.7-8.7-8.7-22.2 0-30.4 8.1-8.7 21.7-8.7 30.4 0l135.3 135.3 135.3-135.3c8.1-8.7 21.7-8.7 30.4 0 8.1 8.1 8.1 21.7 0 30.4L542.6 512.2l135.3 135.2z m0 0" fill="#D3D2D4" p-id="2285"></path></svg></i>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                        <div className={classes.newchartbtns}>
                            <button
                                disabled={!this.state.selected.length}
                                onClick={e => this.send(this.state.selected)}>
                                发送
                        </button>
                            <button className={classes.cancelbtn} onClick={e => this.close()}>取消</button>
                        </div>
                    </div>

                    <div className={classes.leftUser}>
                        {this.renderList()}
                    </div>


                </ModalBody>
            </Modal>
        );
    }
}
