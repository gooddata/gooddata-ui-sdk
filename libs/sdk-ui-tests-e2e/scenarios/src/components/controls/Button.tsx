import React from "react";
import cx from "classnames";

import styles from "./Button.module.scss";

export interface IButtonProps extends React.HTMLProps<HTMLButtonElement> {
    type?: "submit" | "reset" | "button";
    active?: boolean;
}

const Button: React.FC<IButtonProps> = ({
    className = null,
    type = "button",
    active = false,
    children,
    ...restProps
}) => {
    return (
        <button type={type} className={cx(styles.Button, active && styles.Active, className)} {...restProps}>
            {children}
        </button>
    );
};

export default Button;
