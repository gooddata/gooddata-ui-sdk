// (C) 2023-2025 GoodData Corporation
import React from "react";
import cx from "classnames";

import { HEADER_LABEL_CLASS } from "../../base/constants.js";

export type AlignPositions = "left" | "right" | "center";
export const ALIGN_LEFT = "left";

export interface IHeaderCellProps {
    displayText: string;
    className?: string;
    textAlign?: AlignPositions;
}

function TotalHeaderCell({ displayText, className, textAlign = ALIGN_LEFT }: IHeaderCellProps) {
    const classes = cx(HEADER_LABEL_CLASS, "gd-pivot-table-header-label", {
        "gd-pivot-table-header-label--right": textAlign === "right",
        "gd-pivot-table-header-label--center": textAlign === "center",
    });

    return (
        <div className={cx("gd-pivot-table-header", className)}>
            <div className={classes}>
                <span>{displayText ? displayText : ""}</span>
            </div>
        </div>
    );
}

export default TotalHeaderCell;
