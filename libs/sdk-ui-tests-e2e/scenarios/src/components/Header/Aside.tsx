import React from "react";
import { Link } from "react-router-dom";
import cx from "classnames";

import { useAuth } from "../../contexts/Auth";
import { AuthStatus } from "../../contexts/Auth/state";
import InlineLoading from "../InlineLoading";

import styles from "./Header.module.scss";

const Aside: React.FC = () => {
    const { authStatus } = useAuth();
    const { AUTHORIZED, LOGGING_IN, LOGGING_OUT, AUTHORIZING } = AuthStatus;

    return (
        <div className={styles.Aside}>
            {[LOGGING_IN, LOGGING_OUT, AUTHORIZING].includes(authStatus) ? (
                <InlineLoading />
            ) : authStatus === AUTHORIZED ? (
                <Link to="/logout" className={cx(styles.Link, "s-logout-link")}>
                    Logout
                </Link>
            ) : (
                <Link to="/login" className={cx(styles.Link, "s-login-link")}>
                    Login
                </Link>
            )}
        </div>
    );
};

export default Aside;
