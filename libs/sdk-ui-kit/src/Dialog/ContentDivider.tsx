// (C) 2021-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

/**
 * @internal
 */
export function ContentDivider({ className }: { className?: string }) {
    return (
        <div>
            <div className={cx("gd-content-divider", className)} />
        </div>
    );
}
