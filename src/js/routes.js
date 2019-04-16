
import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';

import { Layout, Settings, Second, Home } from './pages';

const Main = withRouter(props => <Layout {...props} />);

export default () => {
    /* eslint-disable */
    return (
        <Main>
            <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/contacts" component={Second} />
                <Route exact path="/settings" component={Settings} />
            </Switch>
        </Main>
    );
    /* eslint-enable */
};
