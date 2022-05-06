// (C) 2022 GoodData Corporation

import React from "react";

export const DialogListEmpty: React.VFC<{ message: JSX.Element }> = ({ message }) => {
    return <div className="gd-dialog-list-empty s-dialog-list-empty">{message}</div>;
};
