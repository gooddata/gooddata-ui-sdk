import React from 'react';
import ReactDOM from 'react-dom';
import * as GD from 'gooddata';

import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom';


import '@gooddata/goodstrap/lib/theme-indigo.scss';
import Header from './components/Header';
import LoginOverlay from './components/LoginOverlay';

import { routes, navigation } from './routes/_list';

export class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: true,
            errorMessage: null
        };
        this.isUserLoggedIn = this.isUserLoggedIn.bind(this);
        this.onUserLogin = this.onUserLogin.bind(this);
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        this.isUserLoggedIn();
    }

    onUserLogin(isLoggedIn, errorMessage) {
        this.setState({
            isLoggedIn
        });

        if (errorMessage) {
            this.setState({ errorMessage: errorMessage.message });
        }
    }

    isUserLoggedIn() {
        GD.user.isLoggedIn()
            .then((isLoggedIn) => {
                this.setState({ isLoggedIn, errorMessage: null });
            })
            .catch((errorMessage) => {
                this.setState({ errorMessage });
            });
    }

    logout() {
        GD.user.logout().then(() => {
            this.setState({
                isLoggedIn: false
            });
        });
    }

    render() {
        const { isLoggedIn } = this.state;

        return (
            <Router>
                <div>
                    <Header
                        navigation={navigation}
                        isUserLoggedIn={isLoggedIn}
                        logoutAction={this.logout}
                    />
                    <main style={{ padding: 20 }}>
                        {routes.map(({ path, Component, exact }) => (<Route
                            key={path}
                            exact={exact}
                            path={path}
                            component={Component}
                        />))}
                    </main>
                    <LoginOverlay onLogin={this.onUserLogin} isLoggedIn={isLoggedIn} />
                </div>
            </Router>
        );
    }
}

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App />, root);
