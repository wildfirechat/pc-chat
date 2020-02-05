import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom'
import ErrorBoundary from "./components/ErrorBoundary";

class ViewManager extends Component {

    static View(props) {
        let name = props.location.search.substr(1);
        if ('voip' === name) {
            let TargetView = require('../../voip')
            return (
                <TargetView/>
            );
        } else {
            let TargetView = require('../../app')
            return (
                <TargetView/>
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
