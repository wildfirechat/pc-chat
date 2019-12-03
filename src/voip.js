
import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import { HashRouter } from 'react-router-dom';
import { ipcRenderer, remote } from 'electron';

import './global.css';
import './assets/fonts/icomoon/style.css';
import 'utils/albumcolors';
import getRoutes from './js/ui/routes';
import stores from './js/ui/stores';
import Voip from './js/ui/pages/Voip';

export default class VoipApp extends Component {
    async componentWillMount() {
    }

    componentDidMount() {

    }

    render() {
        return (
            <Provider {...stores}>
                {/* <HashRouter ref="navigator">
                    {getRoutes()}
                </HashRouter> */}
                <Voip />
            </Provider>
        );
    }
}

module.exports = VoipApp