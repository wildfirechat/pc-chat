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
                    <h2>设置</h2>
                </div>
            </ModalBody>
            </Modal>
        );
    }
}
