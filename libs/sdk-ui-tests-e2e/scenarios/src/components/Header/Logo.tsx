import React from "react";
import cx from "classnames";
import { NavLink } from "react-router-dom";

import { appName } from "../../constants";

import styles from "./Header.module.scss";

const Logo: React.FC = () => {
    return (
        <NavLink to="/" className={cx(styles.Link, styles.Logo)}>
            {appName}
        </NavLink>
    );
};

export default Logo;
