// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";

import { LoadingMask } from "../../LoadingMask";

export const DialogListLoading: React.VFC<{ className?: string }> = ({ className }) => {
    return (
        <div className={cx("gd-dialog-list-loading s-dialog-list-loading", className)}>
            <LoadingMask size="large" />
        </div>
    );
};
