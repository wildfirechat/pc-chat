import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, ModalBody } from 'components/Modal';
import GroupInfo from '../../wfc/model/groupInfo';
import classes from './style.css';
import Switch from 'components/Switch';
import Avatar from 'components/Avatar';
import helper from 'utils/helper';
import wfc from '../../wfc/wfc';
import GroupType from '../../wfc/model/groupType';

@inject(stores => ({
    show: stores.groupMenus.show,
    target: stores.groupMenus.target,
    close: () => stores.groupMenus.toggle(false),
}))
@observer
export default class GroupMenus extends Component {
    setMute(checked, groupId) {
        let mute = checked ? GroupType.stopTalk : GroupType.openTalk;
        this.modifyGroupInfo(groupId, GroupType.modifyGroupMute, mute);
    }

    setPrivateChat(checked, groupId) {
        let privateChat = checked ? GroupType.allowTempChat : GroupType.notAllowTempChat;
        this.modifyGroupInfo(groupId, GroupType.modifyGroupPrivateChat, privateChat);
    }

    setSearch(searchValue, groupId) {
        this.modifyGroupInfo(groupId, GroupType.modifyGroupSearchable, searchValue.toString());
    }

    setJoinType(jsonValue, groupId) {
        this.modifyGroupInfo(groupId, GroupType.modifyGroupJoinType, jsonValue.toString());
    }

    async modifyGroupInfo(groupId, type, newValue) {
        console.log(groupId);
        wfc.modifyGroupInfo(groupId, type, newValue, [0], null, null, (errorCode) => {
            console.log('modify group info fail', errorCode);
        });
    }
    render() {
        var { target } = this.props;
        if (!this.props.show) {
            return false;
        }
        let targetName = '';
        if (target instanceof GroupInfo) {
            targetName = target.name;
        }

        return (
            <Modal
                fullscreen={true}
                show={this.props.show}
                onCancel={e => this.props.close()}
            >
                <ModalBody className={classes.container}>
                    <header>
                        <div dangerouslySetInnerHTML={{ __html: `群组 '${targetName}' 群菜单` }} >
                        </div>

                        <div className={classes.cancelbtn}>
                            <i className="icon-ion-android-close" onClick={e => this.props.close()} />
                        </div>
                    </header>

                    <div className={classes.column}>
                        <span>成员管理</span>
                        <hr />
                        <ul>
                            <li>
                                <label htmlFor="alwaysOnTop">
                                    <span>管理员</span>
                                    <button className="Switch">设置</button>
                                </label>
                            </li>
                            <li>
                                <label htmlFor="mute">
                                    <span>全体禁言</span>
                                    <Switch
                                        id="mute"
                                        defaultChecked={target.mute}
                                        onChange={e => this.setMute(e.target.checked, target.target)}
                                    />
                                </label>
                            </li>
                            <li>
                                <label htmlFor="privateChat">
                                    <span>允许普通成员发起临时会话</span>
                                    <Switch
                                        id="privateChat"
                                        defaultChecked={!target.privateChat}
                                        onChange={e => this.setPrivateChat(e.target.checked, target.target)}
                                    />
                                </label>
                            </li>
                        </ul>
                        <span>加群设置</span>
                        <hr/>
                        <ul>
                            <li>
                                <span className={classes.banner}>加群方式</span>
                                <div className={classes.joinType}>
                                    <span>
                                        <input type="radio"
                                            defaultChecked={target.joinType === 0}
                                            defaultValue="0"
                                            name="joinType"
                                            className="inputRadio"
                                            onChange={e => this.setJoinType(e.target.value, target.target)}
                                        />
                                        <span className="showRadio">不限制加入群</span>
                                    </span>
                                    <span>
                                        <input type="radio"
                                            defaultChecked={target.joinType === 1}
                                            name="joinType"
                                            defaultValue="1"
                                            className="inputRadio"
                                            onChange={e => this.setJoinType(e.target.value, target.target)}
                                        />
                                        <span className="showRadio">群成员可以加人</span>
                                    </span>
                                    <span>
                                        <input type="radio"
                                            defaultChecked={target.joinType === 2}
                                            name="joinType"
                                            defaultValue="2"
                                            className="inputRadio"
                                            onChange={e => this.setJoinType(e.target.value, target.target)}
                                        />
                                        <span className="showRadio">只有管理员可以加人</span>
                                    </span>
                                </div>
                            </li>

                            <li>
                                <span className={classes.banner}>查找方式</span>
                                <span>
                                    <input type="radio"
                                        defaultValue="0"
                                        defaultChecked={!target.searchable}
                                        name="searchable"
                                        className="inputRadio"
                                        onChange={e => this.setSearch(e.target.value, target.target)}
                                    />
                                    <span className="showRadio">允许查找</span>
                                </span>
                                <span>
                                    <input type="radio"
                                        defaultValue="1"
                                        defaultChecked={target.searchable}
                                        name="searchable"
                                        className="inputRadio"
                                        onChange={e => this.setSearch(e.target.value, target.target)}
                                    />
                                    <span className="showRadio">不允许查找</span>
                                </span>
                            </li>
                        </ul>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}
