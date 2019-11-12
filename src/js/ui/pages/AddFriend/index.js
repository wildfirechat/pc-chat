
import React, { Component } from 'react';
import { Modal, ModalBody } from 'components/Modal';
import { inject, observer } from 'mobx-react';
import wfc from '../../../wfc/client/wfc'

import classes from './style.css';

@inject(stores => ({
    show: stores.addfriend.show,
    close: () => stores.addfriend.toggle(false),
    sendRequest: stores.addfriend.sendRequest,
}))
@observer
export default class AddFriend extends Component {
    addFriend() {
        this.props.sendRequest(this.refs.input.value);
        this.props.close();
    }

    render() {
        var { show, close } = this.props;
        let me = wfc.getUserInfo(wfc.getUserId());

        return (
            <Modal
                fullscreen={true}
                onCancel={e => close()}
                show={show}>
                <ModalBody className={classes.container}>
                    Send friend request first

                    <input
                        autoFocus={true}
                        defaultValue={`Hallo, im ${me && me.displayName}`}
                        ref="input"
                        type="text" />

                    <div>
                        <button onClick={e => this.addFriend()}>发送请求</button>

                        <button onClick={e => close()}>取消</button>
                    </div>
                </ModalBody>
            </Modal>
        );
    }
}
