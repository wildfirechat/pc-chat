
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';

import classes from './style.css';
const USER_ID = 'uiuJuJcc';
const TOKEN = 'w3bgeLJJJWvViSJ7fvwz1LPTnCegDb11Q646P5gf9VVRPylImGthlarXlylz0Im1+uAg7Cx5rTuCFhTrAH8c9SJZ4S+bIFzm2RBgXf1RtzRvcLhIjL3XhG7B77YmUxjWhKGdk1mxKn/sGifCWCXdK9PnOCmVLJsdbMMzg2c/otQ=';

// const USER_ID = 'UZUWUWuu';
// const TOKEN = 'mQyY7AF4EPLV6YgWUdypLlftbdauHjE1Nf+FNLTe+LFmMSylcoJlMYAJhK5fra50YqZRImBCf5S9rhyF7nUWIEl4p05l5vIrb0c+OfQmlm8/XBuGPCRmu2T52P66S0tcIPVvnKW9TRPaCEDLJfUfWTZqTANZvUMZnAkumf8zoB0=';
@inject(stores => ({
    avatar: stores.session.avatar,
    code: stores.session.code,
    getCode: stores.session.getCode,
    setupConnectionStatusListener: stores.session.setupConnectionStatusListener,
    test:stores.session.test,
    connect: stores.wfc.connect,
}))

@observer
export default class Login extends Component {
    componentDidMount() {
        //this.props.getCode();
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
                            this.props.test('hello world');
                        }
                    }>Connectxxx</button>
            </div>
        );
    }
}
