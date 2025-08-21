// (C) 2020-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { Typography } from "@gooddata/sdk-ui-kit";

export interface IDropdownSectionHeaderProps {
    className?: string;
    children?: React.ReactNode;
}

export function DropdownSectionHeader({ className, children }: IDropdownSectionHeaderProps) {
    return (
        <Typography
            tagName="h3"
            className={cx("gd-drill-to-url-section-title gd-list-item gd-list-item-header", className)}
        >
            <span>{children}</span>
        </Typography>
    );
}
