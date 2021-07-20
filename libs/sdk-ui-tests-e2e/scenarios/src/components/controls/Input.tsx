import React from "react";
import cx from "classnames";

import styles from "./Input.module.scss";

export interface IInputProps extends React.HTMLProps<HTMLInputElement> {
    hasError?: boolean;
}

const Input: React.FC<IInputProps> = ({
    className = null,
    type = "text",
    hasError = false,
    ...restProps
}) => {
    return (
        <input type={type} className={cx(styles.Input, hasError && styles.Error, className)} {...restProps} />
    );
};

export default Input;
