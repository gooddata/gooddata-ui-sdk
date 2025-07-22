// (C) 2022-2025 GoodData Corporation

import React from "react";
import cx from "classnames";

import { LoadingMask } from "../../LoadingMask/index.js";

export function DialogListLoading({ className }: { className?: string }) {
    return (
        <div
            aria-label="dialog-list-loading"
            className={cx("gd-dialog-list-loading s-dialog-list-loading", className)}
        >
            <LoadingMask size="large" />
        </div>
    );
}
