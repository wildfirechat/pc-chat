import React, {Component} from 'react';
import {Provider} from 'mobx-react';

import './global.css';
import './assets/fonts/icomoon/style.css';
import 'utils/albumcolors';
import stores from './js/ui/stores';
import MultiVoip from './js/ui/pages/Voip/multi';
import SingleVoip from './js/ui/pages/Voip/single';

export default class VoipApp extends Component {

    componentDidMount() {

    }

    render() {
        let type = this.props.type;
        return (
            <Provider {...stores}>
                {
                    type === 'single' ? <SingleVoip/> : <MultiVoip/>
                }
            </Provider>
        );
    }
}

module.exports = VoipApp
