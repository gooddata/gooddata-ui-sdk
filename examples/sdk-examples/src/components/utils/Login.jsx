// (C) 2007-2019 GoodData Corporation
/* eslint-disable react/jsx-closing-tag-location */
import React from "react";
import { PropTypes } from "prop-types";
import { withRouter, Link, Redirect } from "react-router-dom";
import sdk from "@gooddata/gooddata-js";
import { withFormik } from "formik";
import Yup from "yup";
import CustomLoading from "./CustomLoading";
import CustomError from "./CustomError";
import { projectId } from "../../utils/fixtures";

export const LoginFormUncontrolled = props => {
    const {
        values,
        touched,
        errors,
        isSubmitting,
        handleChange,
        handleBlur,
        handleSubmit,
        isLoading,
        apiError,
    } = props;
    return (
        <div className="Login">
            {/* language=CSS */}
            <style jsx>{`
                .Login {
                    max-width: 400px;
                    margin: 20px auto;
                    flex: 1 0 auto;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    align-self: center;
                    text-align: center;
                }

                .LoginLogo {
                    margin-bottom: 10px;
                }

                .LoginForm {
                    width: 100%;
                }

                .LoginForm > div {
                    margin: 20px 0;
                }

                .error {
                    display: block;
                    margin-top: 10px;
                }

                label {
                    display: block;
                    margin-bottom: 5px;
                    color: #6d7680;
                    text-align: left;
                }
            `}</style>
            <img
                src="https://secure.gooddata.com/images/logo-new.png"
                alt="GoodData"
                style={{ height: 70 }}
                className="LoginLogo"
            />
            <form className="LoginForm s-loginForm" onSubmit={handleSubmit}>
                <h1>Sign in to the Live&nbsp;Examples</h1>
                <p>
                    Accessing Live Examples requires a unique one-time{" "}
                    <Link to="/registration">registration</Link> even if you already have a GoodData account.
                </p>

                <div className="gd-input">
                    <label htmlFor="email">E-mail</label>
                    <input
                        className={`gd-input-field s-login-input-email ${
                            errors.email && touched.email ? " has-error" : ""
                        }`}
                        type="email"
                        id="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="e-mail"
                    />
                    {errors.email && touched.email && <div className="gd-message error">{errors.email}</div>}
                </div>
                <div className="gd-input">
                    <label htmlFor="password">Password</label>
                    <input
                        className={`gd-input-field s-login-input-password ${
                            errors.password && touched.password ? " has-error" : ""
                        }`}
                        type="password"
                        name="password"
                        id="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="password"
                    />
                    {errors.password && touched.password && (
                        <div className="gd-message error">{errors.password}</div>
                    )}
                </div>
                {apiError && !isLoading && <CustomError height={null} message={apiError} />}
                {isLoading && <CustomLoading height={null} label="Logging in&hellip;" />}
                <div className="gd-input buttons">
                    <button
                        type="submit"
                        className={`gd-button gd-button-primary gd-button-important submit-button s-login-submit${
                            isSubmitting || isLoading ? " disabled" : ""
                        }`}
                        disabled={isSubmitting || isLoading}
                        tabIndex="-1"
                    >
                        Sign in
                    </button>
                    <Link
                        className="gd-button gd-button-link"
                        to={{
                            pathname: "/registration",
                        }}
                    >
                        <span>Register</span>
                    </Link>
                </div>
            </form>
        </div>
    );
};

LoginFormUncontrolled.propTypes = {
    values: PropTypes.object.isRequired,
    touched: PropTypes.object.isRequired,
    errors: PropTypes.object.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    handleChange: PropTypes.func.isRequired,
    handleBlur: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    apiError: PropTypes.string,
};

LoginFormUncontrolled.defaultProps = {
    apiError: null,
};

export const LoginForm = withFormik({
    mapPropsToValues: ({ email = "", password = "" }) => ({
        email,
        password,
    }),
    validationSchema: Yup.object().shape({
        email: Yup.string()
            .email("Invalid e-mail address")
            .required("E-mail is required"),
        password: Yup.string().required("Password is required"),
    }),
    handleSubmit: ({ email, password }, { props: { logIn }, setSubmitting }) => {
        logIn(email, password)
            .then(() => {
                setSubmitting(false);
            })
            .catch(() => {
                setSubmitting(false);
            });
    },
    displayName: "LoginForm", // helps with React DevTools
})(LoginFormUncontrolled);

class Login extends React.Component {
    static propTypes = {
        onLogin: PropTypes.func,
        redirectUri: PropTypes.string,
        email: PropTypes.string,
        location: PropTypes.object.isRequired,
        password: PropTypes.string,
        isLoggedIn: PropTypes.bool,
    };

    static defaultProps = {
        onLogin: () => {},
        redirectUri: "/",
        email: "",
        password: "",
        isLoggedIn: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            email: props.email,
            password: props.password,
            autoLoginAttempted: false,
            isLoggedIn: false,
            isProjectAssigned: null,
            isLoading: false,
            error: null,
        };
    }

    componentWillMount() {
        const {
            location: { state: { email, password } = {} },
        } = this.props;
        const { autoLoginAttempted } = this.state;
        if (this.props.isLoggedIn) {
            this.checkProjectAvailability(null);
        } else if (email && password && !autoLoginAttempted) {
            this.setState({
                email,
                password,
                autoLoginAttempted: true,
            });
            this.logIn(email, password);
        }
    }

    setErrorCheckingProjectAvailability = error => {
        this.setState({
            error: `Could not confirm demo project availability. Examples might not have access to the demo project with id ${projectId}.
            You can try logging out and logging back in. ${error}`,
            isProjectAssigned: null,
        });
    };

    checkProjectAvailability = newProfileUri => {
        return (newProfileUri
            ? Promise.resolve(newProfileUri)
            : sdk.user.getAccountInfo().then(accountInfo => {
                  return accountInfo.profileUri;
              })
        )
            .then(profileUri => {
                const userId = profileUri.split("/").reverse()[0];
                return sdk.project.getProjects(userId).then(projects => {
                    // find project
                    const isProjectAssigned = projects.some(project => {
                        return project.links.metadata.split("/").reverse()[0] === projectId;
                    });
                    this.setState({
                        error: null,
                        isProjectAssigned,
                    });
                    if (!isProjectAssigned) {
                        return sdk.xhr
                            .post("/api/assign-project", {
                                data: {
                                    user: profileUri,
                                },
                            })
                            .then(() => {
                                this.setState({
                                    error: null,
                                    isProjectAssigned: true,
                                });
                            });
                    }
                    return Promise.resolve();
                });
            })
            .catch(error => {
                this.setErrorCheckingProjectAvailability(error);
            });
    };

    logIn = (email, password) => {
        this.setState({
            isLoading: true,
            email,
            password,
        });
        return sdk.user
            .login(email, password)
            .then(userData => {
                this.setState({
                    isLoggedIn: true,
                    isLoading: false,
                    error: null,
                });
                this.props.onLogin(true, null);

                return this.checkProjectAvailability(userData.userLogin.profile);
            })
            .catch(error => {
                this.setState({
                    isLoggedIn: false,
                    isLoading: false,
                    autoLoginAttempted: true,
                    error: `${error} Wrong email or password.`,
                });
                return error;
            });
    };

    render() {
        const { isLoading, isProjectAssigned, email, password, error } = this.state;
        const isLoggedIn = this.state.isLoggedIn || this.props.isLoggedIn;
        const verticalCenterStyle = {
            flex: "1 0 auto",
            display: "flex",
            maxWidth: "600px",
            margin: "0 auto",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "stretch",
        };
        if (isLoggedIn) {
            if (error) {
                return (
                    <div style={verticalCenterStyle}>
                        <CustomError message={error} />
                    </div>
                );
            }
            if (isProjectAssigned) {
                return <Redirect to={this.props.redirectUri} />;
            }
            if (isProjectAssigned === false) {
                return (
                    <div style={verticalCenterStyle}>
                        <CustomLoading height={null} label="Assigning demo project&hellip;" />
                    </div>
                );
            }
            return (
                <div style={verticalCenterStyle} className="s-checkingDemoAvailability">
                    <CustomLoading height={null} label="Checking demo availability&hellip;" />
                </div>
            );
        }
        return (
            <LoginForm
                email={email}
                password={password}
                apiError={error}
                logIn={this.logIn}
                isLoading={isLoading}
            />
        );
    }
}

export default withRouter(Login);
