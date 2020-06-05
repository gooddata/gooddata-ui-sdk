// (C) 2019 GoodData Corporation
import React, { CSSProperties } from "react";
import { Redirect } from "react-router-dom";

import { useAuth, AuthStatus } from "../../context/auth";
import { ENV_CREDENTIALS } from "../../constants/env";

import { CustomLoading } from "../CustomLoading";
import { CustomError } from "../CustomError";

import { LoginForm } from "./LoginForm";
import { useDemoProjectAuth } from "./state";
import { DemoProjectAuthStatus } from "./types";

const verticalCenterStyle: CSSProperties = {
    flex: "1 0 auto",
    display: "flex",
    maxWidth: "600px",
    margin: "0 auto",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "stretch",
};

export const Login: React.FC = () => {
    const { login, authStatus, authError } = useAuth();
    const { authStatus: demoProjectAuthStatus, error } = useDemoProjectAuth();

    if (authStatus === AuthStatus.AUTHORIZED) {
        if (error) {
            return (
                <div style={verticalCenterStyle}>
                    <CustomError message={error} />
                </div>
            );
        }
        if (demoProjectAuthStatus === DemoProjectAuthStatus.AUTHORIZED) {
            return <Redirect to={"/"} />;
        }
        if (demoProjectAuthStatus === DemoProjectAuthStatus.ASSIGNING_DEMO_PROJECT_TO_USER) {
            return (
                <div style={verticalCenterStyle}>
                    <CustomLoading height={undefined} label="Assigning demo project&hellip;" />
                </div>
            );
        }
        return (
            <div style={verticalCenterStyle} className="s-checkingDemoAvailability">
                <CustomLoading height={undefined} label="Checking demo availability&hellip;" />
            </div>
        );
    }

    return (
        <LoginForm
            email={ENV_CREDENTIALS.username}
            password={ENV_CREDENTIALS.password}
            apiError={authError || error}
            logIn={login}
            isLoading={
                authStatus !== AuthStatus.UNAUTHORIZED ||
                demoProjectAuthStatus !== DemoProjectAuthStatus.UNAUTHORIZED
            }
        />
    );
};
