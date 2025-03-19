// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ScreenSize } from "@gooddata/sdk-model";
import { CommonExportDataAttributes } from "../../export/index.js";

interface IDashboardItemProps extends React.HTMLAttributes<HTMLDivElement> {
    screen: ScreenSize;
    description?: string;
    ref?: React.Ref<HTMLDivElement>;
    exportData?: CommonExportDataAttributes;
}

// done like this instead of a template string so that the code is greppable for the individual classes
const screenClasses: { [S in ScreenSize]: string } = {
    xs: "layout-xs",
    sm: "layout-sm",
    md: "layout-md",
    lg: "layout-lg",
    xl: "layout-xl",
};

export const DashboardItem: React.FC<IDashboardItemProps> = React.forwardRef(
    ({ className, screen, description, exportData, ...props }, ref) => {
        return (
            <figure
                {...props}
                {...exportData}
                {...(description ? { "aria-description": description } : {})}
                className={cx(className, "dash-item", "s-dash-item", screenClasses[screen])}
                tabIndex={0}
                ref={ref}
                role="figure"
            />
        );
    },
);

DashboardItem.displayName = "DashboardItem";
