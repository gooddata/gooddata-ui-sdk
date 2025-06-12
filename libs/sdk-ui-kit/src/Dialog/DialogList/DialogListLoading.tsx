// (C) 2022 GoodData Corporation

import React from "react";
import cx from "classnames";

import { LoadingMask } from "../../LoadingMask/index.js";

export const DialogListLoading: React.VFC<{ className?: string }> = ({ className }) => {
    return (
        <div
            aria-label="dialog-list-loading"
            className={cx("gd-dialog-list-loading s-dialog-list-loading", className)}
        >
            <LoadingMask size="large" />
        </div>
    );
};
