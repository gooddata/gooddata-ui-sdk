// (C) 2007-2019 GoodData Corporation
import React, { CSSProperties, useState, useEffect } from "react";
import { withRouter, Redirect } from "react-router-dom";
import sdk from "@gooddata/gd-bear-client";
import CustomLoading from "./CustomLoading";
import CustomError from "./CustomError";
import { LoginForm } from "./LoginForm";

import { projectId } from "../../utils/fixtures";
import { useBackend } from "../../backend";

interface ILoginOuterProps {
    onLogin: (isLoggedIn?: boolean, errorMessage?: string | null) => {};
    location: {
        state?: {
            email: string;
            password: string;
        };
    };
    redirectUri?: string;
    email?: string;
    password?: string;
    isLoggedIn?: boolean;
    logIn: (email: string, password: string) => Promise<void>;
}

interface ILoginOuterState {
    email: string;
    password: string;
    autoLoginAttempted: boolean;
    isLoggedIn: boolean;
    isProjectAssigned: boolean | null;
    isLoading: boolean;
    error: null | string;
}

const verticalCenterStyle: CSSProperties = {
    flex: "1 0 auto",
    display: "flex",
    maxWidth: "600px",
    margin: "0 auto",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
};

const CoreLogin: React.FC<ILoginOuterProps> = props => {
    const backend = useBackend();

    const { onLogin, redirectUri = "/", email = "", password = "", isLoggedIn = null } = props;

    const [state, setState] = useState({
        email: email,
        password: password,
        autoLoginAttempted: false,
        isLoggedIn: false,
        isProjectAssigned: null,
        isLoading: false,
        error: null,
    });

    const setErrorCheckingProjectAvailability = error => {
        setState(oldState => ({
            ...oldState,
            error: `Could not confirm demo project availability. Examples might not have access to the demo project with id ${projectId}.
            You can try logging out and logging back in. ${error}`,
            isProjectAssigned: null,
        }));
    };

    const checkProjectAvailability = newProfileUri => {
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
                    setState(oldState => ({
                        ...oldState,
                        error: null,
                        isProjectAssigned,
                    }));
                    if (!isProjectAssigned) {
                        return sdk.xhr
                            .post("/api/assign-project", {
                                data: {
                                    user: profileUri,
                                },
                            })
                            .then(() => {
                                setState(oldState => ({
                                    ...oldState,
                                    error: null,
                                    isProjectAssigned: true,
                                }));
                            });
                    }
                    return Promise.resolve();
                });
            })
            .catch(error => {
                this.setErrorCheckingProjectAvailability(error);
            });
    };

    const logIn = (email, password) => {
        setState(oldState => ({
            ...oldState,
            isLoading: true,
            email,
            password,
        }));

        return sdk.user
            .login(email, password)
            .then(userData => {
                setState(oldState => ({
                    ...oldState,
                    isLoggedIn: true,
                    isLoading: false,
                    error: null,
                }));
                onLogin(true, null);

                return checkProjectAvailability(userData.userLogin.profile);
            })
            .catch(error => {
                setState(oldState => ({
                    ...oldState,
                    isLoggedIn: false,
                    isLoading: false,
                    autoLoginAttempted: true,
                    error: `${error} Wrong email or password.`,
                }));
                return error;
            });
    };

    useEffect(() => {
        const {
            location: { state: { email = "", password = "" } = {} },
        } = props;

        const { autoLoginAttempted } = state;

        if (isLoggedIn) {
            checkProjectAvailability(null);
        } else if (email && password && !autoLoginAttempted) {
            setState(oldState => ({
                ...oldState,
                email,
                password,
                autoLoginAttempted: true,
            }));
            logIn(email, password);
        }
    }, []);

    const { isLoading, isProjectAssigned, error } = state;
    const isLoggedIn_ = state.isLoggedIn || props.isLoggedIn;

    if (isLoggedIn_) {
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
            email={state.email}
            password={state.password}
            apiError={error}
            logIn={this.logIn}
            isLoading={isLoading}
        />
    );
};

export const Login = withRouter(CoreLogin);
