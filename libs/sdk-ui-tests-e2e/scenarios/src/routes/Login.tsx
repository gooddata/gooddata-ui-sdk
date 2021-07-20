import React from "react";

import Page from "../components/Page";
import LoginForm from "../components/Auth/LoginForm";
import { useAuth } from "../contexts/Auth";

import styles from "../components/Page.module.scss";

const Login: React.FC = () => {
    const { login, authError } = useAuth();

    return (
        <Page className={styles.Inverse} mainClassName={styles.VerticalCenter}>
            <LoginForm login={login} loginError={authError} email="" password="" />
        </Page>
    );
};

export default Login;
