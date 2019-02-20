
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import classes from './style.css';

const USER_ID = 'cgc8c8VV';
const TOKEN = 'Gyeq585IjnfiYd3PzhU33XRTTCGAyaVUzBmdDQD3evJ4bpRHCN52m1An2Ea0x29zniRRWd4vcyFPUcefIz0zBiR32vkLNsuGH8USKZ1wbq8Rl0hhOQxphg3zZSquDJ/ByW0Y9BRTIbyLlx1qF+camOexoSfOV6cRqsnKbBSEGKI=';
@inject(stores => ({
    avatar: stores.session.avatar,
    code: stores.session.code,
    getCode: stores.session.getCode,
    setupConnectionStatusListener: stores.session.setupConnectionStatusListener,
    connect: stores.session.connect,
}))

@observer
export default class Login extends Component {
    componentDidMount() {
        //this.props.getCode();
        this.props.setupConnectionStatusListener();

    }

    componentWillUnmount(){
        console.log('login will disappear');
    }

    render() {
        return (
            <div className={classes.container}>
                <div >
                    <p>login to wildfire chat</p>
                </div>
                <input
                    autoFocus={true}
                    defaultValue={USER_ID}
                    ref="userId"
                    type="text" />

                <input
                    autoFocus={true}
                    ref="token"
                    defaultValue={TOKEN}
                    type="text" />

                    <button onClick={
                        e => {
                            console.log('to connect');
                            this.props.connect(this.refs.userId.value, this.refs.token.value);
                            console.log('to connect end');
                        }
                    }>Connectxxx</button>
            </div>
        );
    }
}
