/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import ReactDOM from 'react-dom';
import sdk from 'gooddata';

import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom';


import '@gooddata/goodstrap/lib/theme-indigo.scss';
import Header from './components/utils/Header';
import LoginOverlay from './components/utils/LoginOverlay';
import { Error } from './components/utils/Error';

import { routes, mainRoutes } from './routes/_list';

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
        sdk.user.isLoggedIn()
            .then((isLoggedIn) => {
                this.setState({ isLoggedIn, errorMessage: null });
            })
            .catch((errorMessage) => {
                this.setState({ errorMessage });
            });
    }

    logout() {
        sdk.user.logout().then(() => {
            this.setState({
                isLoggedIn: false
            });
        });
    }

    render() {
        const { isLoggedIn, errorMessage } = this.state;

        return (
            <Router basename={BASEPATH}>
                <div className="main-wrapper">
                    {/* language=CSS */}
                    <style jsx>{`
                        :global(html),
                        :global(body),
                        :global(.root) {
                            height: 100%;
                        }

                        :global(hr.separator) {
                            border: 1px solid #EEE;
                            border-width: 1px 0 0 0;
                            margin: 20px 0;
                        }

                        :global(.main-wrapper) {
                            display: flex;
                            height: 100%;
                            flex-direction: column;
                            justify-content: flex-start;
                            align-items: stretch;
                        }

                        main {
                            flex: 1;
                            overflow: auto;
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-start;
                            align-items: stretch;
                        }
                    `}</style>
                    <Header
                        mainRoutes={mainRoutes}
                        routes={routes}
                        isUserLoggedIn={isLoggedIn}
                        logoutAction={this.logout}
                    />
                    {errorMessage
                        ? <Error error={{ status: '403', message: errorMessage }} />
                        : null
                    }
                    <main style={{ padding: 20 }}>
                        {routes.map(({ title, path, Component, redirectTo, ...routeProps }) => (<Route
                            key={path}
                            path={path}
                            component={Component}
                            {...routeProps}
                        />))}
                    </main>
                    <LoginOverlay onLogin={this.onUserLogin} isLoggedIn={isLoggedIn} />
                </div>
            </Router>
        );
    }
}

const root = document.createElement('div');
root.className = 'root';
document.body.appendChild(root);
ReactDOM.render(<App />, root);
