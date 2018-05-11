// (C) 2007-2018 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import ReactDOM from 'react-dom';
import sdk from '@gooddata/gooddata-js';

import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch
} from 'react-router-dom';


import '@gooddata/goodstrap/lib/theme-indigo.scss';
import Header from './components/utils/Header';
import { CustomError } from './components/utils/CustomError';
import CustomLoading from './components/utils/CustomLoading';

import { routes, userRoutes, mainRoutes } from './routes/_list';

export class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: null,
            isLoadingUserState: true,
            errorMessage: null
        };
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        this.isUserLoggedIn();
    }

    onUserLogin = (isLoggedIn, errorMessage) => {
        this.setState({
            isLoggedIn,
            isLoadingUserState: false,
            errorMessage
        });
    }

    isUserLoggedIn = () => {
        this.setState({
            isLoadingUserState: true
        });
        return sdk.user.isLoggedIn()
            .then((isLoggedIn) => {
                this.onUserLogin(isLoggedIn, null);
            })
            .catch((errorMessage) => {
                this.onUserLogin(false, errorMessage);
            });
    }

    logout() {
        this.setState({
            isLoadingUserState: true
        });
        sdk.user.logout().then(() => {
            this.setState({
                isLoggedIn: false,
                isLoadingUserState: false
            });
        }).catch(() => {
            this.setState({
                isLoadingUserState: false
            });
        });
    }

    renderContent = () => {
        const { isLoggedIn, isLoadingUserState } = this.state;
        const flexWrapperStyles = {
            flex: '1 0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch'
        };
        if (isLoadingUserState) {
            return (
                <div
                    style={{
                        ...flexWrapperStyles,
                        justifyContent: 'center'
                    }}
                ><CustomLoading height={null} label="Checking if user is already logged in&hellip;" /></div>
            );
        }
        return (<div style={flexWrapperStyles}>
            <Switch>
                {userRoutes.map(({ title, path, Component, redirectTo, ...routeProps }) => (<Route
                    key={path}
                    path={path}
                    component={() => <Component isLoggedIn={isLoggedIn} onLogin={this.onUserLogin} />}
                    {...routeProps}
                />))}
                {isLoggedIn === false && <Route component={() => (
                    <Redirect to={{
                        pathname: '/login',
                        state: {
                            redirectUriAfterLogin: '/',
                            defaultRoute: true
                        }
                    }}
                    />
                )}
                />}
            </Switch>
            {isLoggedIn === true &&
                routes.map(({ title, path, Component, redirectTo, ...routeProps }) => (
                    <Route
                        key={path}
                        path={path}
                        component={Component}
                        {...routeProps}
                    />))
            }
        </div>
        );
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

                        :global(body) {
                            background-color: #fafafa;
                        }

                        :global(*),
                        :global(::before),
                        :global(::after) {
                            box-sizing: border-box;
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
                            align-items: center;
                        }

                        :global(h1),
                        :global(h2),
                        :global(h3) {
                            color: black;
                        }

                        :global(h1) {
                            font-weight: bold;
                            font-size: 50px;
                            line-height: 50px;
                        }

                        :global(h2) {
                            font-weight: normal;
                            font-size: 40px;
                            line-height: 55px;
                        }

                        :global(h3) {
                            font-weight: bold;
                            font-size: 24px;
                        }

                        :global(p) {
                            max-width: 800px;
                        }

                        main {
                            flex: 1 1 auto;
                            overflow: auto;
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-start;
                            align-items: stretch;
                            width: 100%;
                            max-width: 1400px;
                            padding: 20px;
                        }
                    `}</style>
                    <Header
                        mainRoutes={mainRoutes}
                        routes={routes}
                        isUserLoggedIn={isLoggedIn}
                        logoutAction={this.logout}
                    />
                    {errorMessage
                        ? <CustomError error={{ status: '403', message: errorMessage }} />
                        : null
                    }
                    <main>
                        {this.renderContent()}
                    </main>
                </div>
            </Router>
        );
    }
}

const root = document.createElement('div');
root.className = 'root';
document.body.appendChild(root);
ReactDOM.render(<App />, root);
