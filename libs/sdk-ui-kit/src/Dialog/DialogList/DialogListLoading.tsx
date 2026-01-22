// (C) 2022-2025 GoodData Corporation

import cx from "classnames";

import { LoadingMask } from "../../LoadingMask/LoadingMask.js";

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
