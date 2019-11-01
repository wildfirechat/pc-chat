
import React, { Component } from 'react';
import { Modal, ModalBody } from 'components/Modal';
import { inject, observer } from 'mobx-react';

import classes from './style.css';
import UserList from 'components/UserList';
import helper from 'utils/helper';
import wfc from '../../wfc/client/wfc'

@inject(stores => ({
    show: stores.addmember.show,
    searching: stores.addmember.query,
    getList: () => {
        var { addmember, contacts } = stores;

        if (addmember.query) {
            return addmember.list;
        }

        let groupMemberIds = wfc.getGroupMemberIds(stores.chat.target.target);
        let myUid = wfc.getUserId();
        return contacts.memberList.filter(
            e => groupMemberIds.indexOf(e.uid) < 0
                || e.uid === myUid
        );
    },
    addMember: async (userids) => {
        var groupId = stores.chat.conversation.target;

        return stores.addmember.addMember(groupId, userids);
    },
    getUser: (userid) => {
        return stores.contacts.memberList.find(e => e.uid === userid);
    },
    search: stores.addmember.search,
    close: () => {
        stores.addmember.reset();
        stores.addmember.toggle(false);
    },
}))
@observer
export default class AddMember extends Component {
    state = {
        selected: [],
    };

    close() {
        this.props.close();
        this.setState({
            selected: [],
        });
    }

    async add(userids) {
        await this.props.addMember(userids);
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
                    Add Members

                    <div className={classes.avatars}>
                        {
                            this.state.selected.map((e, index) => {
                                var user = this.props.getUser(e);
                                return (
                                    <img
                                        key={index}
                                        onClick={ev => this.refs.users.removeSelected(e)}
                                        src={user.portrait} />
                                );
                            })
                        }
                    </div>

                    {this.renderList()}

                    <div>
                        <button
                            disabled={!this.state.selected.length}
                            onClick={e => this.add(this.state.selected)}>
                            添加成员
                        </button>

                        <button onClick={e => this.close()}>取消</button>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}
