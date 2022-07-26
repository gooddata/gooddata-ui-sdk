// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";

export const DialogListEmpty: React.VFC<{ message: JSX.Element; className?: string }> = ({
    message,
    className,
}) => {
    return <div className={cx("gd-dialog-list-empty s-dialog-list-empty", className)}>{message}</div>;
};
