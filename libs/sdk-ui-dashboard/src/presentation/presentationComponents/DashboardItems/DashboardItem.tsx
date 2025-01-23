// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ScreenSize } from "@gooddata/sdk-model";

interface IDashboardItemProps extends React.HTMLAttributes<HTMLDivElement> {
    screen: ScreenSize;
    ref?: React.Ref<HTMLDivElement>;
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
    ({ className, screen, ...props }, ref) => {
        return (
            <div
                {...props}
                className={cx(className, "dash-item", "s-dash-item", screenClasses[screen])}
                tabIndex={0}
                ref={ref}
            />
        );
    },
);

DashboardItem.displayName = "DashboardItem";
