import React from 'react';
import ReactDOM from 'react-dom';
import * as GD from 'gooddata';

import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom';


import '@gooddata/goodstrap/lib/theme-indigo.scss';

import { routes, navigation } from './routes/_list';

export class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: null,
            errorMessage: null
        };
        this.isUserLoggedIn = this.isUserLoggedIn.bind(this);
    }

    componentWillMount() {
        this.isUserLoggedIn();
    }

    isUserLoggedIn() {
        this.setState({
            isLoggedIn: null,
            errorMessage: null
        });
        return GD.user.isLoggedIn()
            .then((isLoggedIn) => {
                this.setState({ isLoggedIn, errorMessage: null });
                if (!isLoggedIn && typeof window !== 'undefined') {
                    window.location.href = '/account.html';
                }
            })
            .catch((errorMessage) => {
                this.setState({ errorMessage });
            });
    }

    render() {
        return (<Router>
            <div>
                { this.state.errorMessage !== null
                    ? <div className="gd-message error">
                        <style jsx>{`
                            .gd-message {
                                margin: 0;
                                padding: 20px;
                                display: block;
                            }
                        `}</style>
                        <div className="gd-message-text">
                            <strong>Error while checking logged in status</strong><br />
                            {this.state.errorMessage}<br />
                            If you are having trouble retry, or <a href="/account.html"> log in manually</a>.
                            &emsp;<button
                                className="button button-secondary"
                                onClick={this.isUserLoggedIn}
                            >Retry</button>
                        </div>
                    </div>
                    : null
                }
                { !this.state.isLoggedIn
                    ? <div className="gd-message progress">
                        <style jsx>{`
                            .gd-message {
                                margin: 0;
                                padding: 20px;
                                display: block;
                            }
                            .gd-spinner {
                                float: left;
                                margin-right: 20px;
                            }
                        `}</style>
                        <div className="gd-message-text">
                            <div className="gd-spinner large" />
                            <strong>Checking logged in status…</strong><br />
                            You should be redirected to GoodData platform login screen, if you are not logged in already. If not, retry, or <a href="/account.html"> log in manually</a>.
                            &emsp;<button
                                className="button button-secondary"
                                onClick={this.isUserLoggedIn}
                            >Retry</button>
                        </div>
                    </div>
                    : null
                }
                { routes.map(({ path, Component, exact }) => (<Route
                    key={path}
                    path={path}
                    render={
                        props => (<Component navigation={navigation} {...props} />)
                    }
                    exact={exact}
                />)) }
            </div>
        </Router>);
    }
}

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App />, root);
