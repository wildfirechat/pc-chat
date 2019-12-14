
import React, { Component } from 'react';
import { Provider } from 'mobx-react';

import './global.css';
import './assets/fonts/icomoon/style.css';
import 'utils/albumcolors';
import stores from './js/ui/stores';
import Voip from './js/ui/components/Voip';

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