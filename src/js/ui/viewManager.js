import React, { Component } from 'react';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom'
import App from '../../app';
import VoipApp from '../../voip';

class ViewManager extends Component {

    static Views() {
        return {
            main: <App />,
            voip: <VoipApp />
        }
    }

    static View(props) {
        let name = props.location.search.substr(1);
        let view = ViewManager.Views()[name];
        console.log('xxxxxx view manager', name, view);
        if (view == null)
            throw new Error("View '" + name + "' is undefined");
        return view;
    }

    render() {
        return (
            <Router>
                <div>
                    <Route path='/' component={ViewManager.View} />
                </div>
            </Router>
        );
    }
}

export default ViewManager