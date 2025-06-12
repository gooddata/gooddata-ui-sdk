// (C) 2021-2024 GoodData Corporation
import React from "react";
import cx from "classnames";

/**
 * @internal
 */
export const ContentDivider: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div>
            <div className={cx("gd-content-divider", className)} />
        </div>
    );
};
