import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom'
import ErrorBoundary from "./components/ErrorBoundary";
import App from '../../app'
import VoipApp from "../../voip";

class ViewManager extends Component {

    static View(props) {
        let name = props.location.search.substr(1);
        if ('voip-single' === name) {
            return (
                <VoipApp type='single'/>
            );
        } else if ('voip-multi' === name) {
            return (
                <VoipApp type='multi'/>
            );
        } else {
            return (
                <App/>
            );
        }
    }

    render() {
        return (
            <ErrorBoundary>
                <Router>
                    <div>
                        <Route path='/' component={ViewManager.View}/>
                    </div>
                </Router>
            </ErrorBoundary>
        );
    }
}

export default ViewManager
