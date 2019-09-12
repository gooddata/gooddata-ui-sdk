// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PropTypes } from "prop-types";
import { withRouter } from "react-router-dom";
import sdk from "@gooddata/gooddata-js";

export const title = "Sign in to GoodData platform";

class LoginOverlay extends React.Component {
    static propTypes = {
        isLoggedIn: PropTypes.bool.isRequired,
        onLogin: PropTypes.func,
    };

    static defaultProps = {
        onLogin: () => {},
    };

    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            isLoggedIn: true,
            error: null,
        };

        this.onUsernameChange = this.onUsernameChange.bind(this);
        this.onPasswordChange = this.onPasswordChange.bind(this);
        this.doLogin = this.doLogin.bind(this);
        this.renderLogInForm = this.renderLogInForm.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isLoggedIn !== this.props.isLoggedIn) {
            this.setState({
                isLoggedIn: nextProps.isLoggedIn,
            });
        }
    }

    onUsernameChange(e) {
        this.setState({
            username: e.target.value,
        });
    }

    onPasswordChange(e) {
        this.setState({
            password: e.target.value,
        });
    }

    doLogin(e) {
        e.preventDefault();
        const { username, password } = this.state;

        sdk.user
            .login(username, password)
            .then(() => {
                this.setState({
                    isLoggedIn: true,
                    error: null,
                });
                this.props.onLogin(true, null);
                if (typeof window !== "undefined") {
                    window.location.reload();
                }
            })
            .catch(error => {
                this.setState({
                    isLoggedIn: false,
                    error: "Wrong username and/or password",
                });
                this.props.onLogin(false, error);
            });
    }

    renderLogInForm() {
        return (
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 99999,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                <div
                    className="s-login-overlay"
                    style={{
                        width: "100%",
                        maxWidth: 500,
                        margin: "-250px auto 0 auto",
                        padding: "50px",
                        background: "#ffffff",
                        borderRadius: "10px",
                    }}
                >
                    <div style={{ maxHeight: 70, textAlign: "center" }}>
                        <img
                            src="https://secure.gooddata.com/images/logo-new.png"
                            alt="GoodData"
                            style={{ height: 70 }}
                        />
                    </div>
                    <form onSubmit={this.doLogin}>
                        <h1 style={{ textAlign: "center", padding: 10 }}>{title}</h1>
                        <div className="gd-input" style={{ margin: "5px 0" }}>
                            <label htmlFor="email">e-mail</label>
                            <input
                                className="gd-input-field s-login-input-username"
                                type="email"
                                name="email"
                                value={this.state.username}
                                onChange={this.onUsernameChange}
                            />
                        </div>
                        <div className="gd-input" style={{ margin: "5px 0" }}>
                            <label htmlFor="password">password</label>
                            <input
                                className="gd-input-field s-login-input-password"
                                type="password"
                                name="password"
                                value={this.state.password}
                                onChange={this.onPasswordChange}
                            />
                        </div>
                        {this.state.error && this.renderError()}
                        <div className="gd-input" style={{ margin: "5px 0", textAlign: "center" }}>
                            <button
                                type="submit"
                                className="gd-button gd-button-primary gd-button-important submit-button s-login-submit"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    renderError() {
        return (
            <div className="gd-message" style={{ display: "block", margin: "5px 0" }}>
                {this.state.error}
            </div>
        );
    }

    render() {
        return this.state.isLoggedIn ? null : this.renderLogInForm();
    }
}

export default withRouter(LoginOverlay);
