import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Modal, ModalBody } from 'components/Modal';
import GroupInfo from '../../wfc/model/groupInfo';
import classes from './style.css';
import Switch from 'components/Switch';
import Avatar from 'components/Avatar';
import helper from 'utils/helper';

@inject(stores => ({
    show: stores.groupMenus.show,
    target: stores.groupMenus.target,
    close: () => stores.groupMenus.toggle(false),
}))
@observer
export default class GroupMenus extends Component {
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
                        <i 
                            className="icon-ion-android-close"
                            onClick={e => this.props.close()} />
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
                            <label htmlFor="alwaysOnTop">
                                <span>全体禁言</span>
                                <Switch id="alwaysOnTop" />
                            </label>
                        </li>
                        <li>
                            <label htmlFor="alwaysOnTop">
                                <span>允许普通成员发起临时会话</span>
                                <Switch id="alwaysOnTop" />
                            </label>
                        </li>
                    </ul>
                    <span>加群设置</span>
                    <hr/>
                    <ul>
                        <li>
                            <span className={classes.banner}>加群方式</span>
                            <span>
                                <input type="radio" id="" className="inputRadio" />
                                <span class="showRadio">不限制加入群</span>
                            </span>
                            <span>
                                <input type="radio" id="" className="inputRadio" />
                                <span class="showRadio">不限制加入群</span>
                            </span>
                        </li>

                        <li>
                            <span className={classes.banner}>查找方式</span>
                            <span>
                                <input type="radio" id="" className="inputRadio" />
                                <span class="showRadio">允许查找</span>
                            </span>
                            <span>
                                <input type="radio" id="" className="inputRadio" />
                                <span class="showRadio">不允许查找</span>
                            </span>
                        </li>
                    </ul>
                </div>
            </ModalBody>
            </Modal>
        );
    }
}
