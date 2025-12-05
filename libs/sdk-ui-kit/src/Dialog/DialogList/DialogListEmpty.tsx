// (C) 2022-2025 GoodData Corporation

import { ReactElement } from "react";

import cx from "classnames";

export function DialogListEmpty({ message, className }: { message?: ReactElement; className?: string }) {
    return (
        <div
            aria-label="dialog-list-empty"
            className={cx("gd-dialog-list-empty s-dialog-list-empty", className)}
        >
            {message}
        </div>
    );
}
