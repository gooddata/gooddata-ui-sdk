// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ResponsiveScreenType } from "@gooddata/sdk-backend-spi";

interface IDashboardItemProps extends React.HTMLAttributes<HTMLDivElement> {
    screen: ResponsiveScreenType;
}

// done like this instead of a template string so that the code is greppable for the individual classes
const screenClasses: { [S in ResponsiveScreenType]: string } = {
    xs: "layout-xs",
    sm: "layout-sm",
    md: "layout-md",
    lg: "layout-lg",
    xl: "layout-xl",
};

export const DashboardItem: React.FC<IDashboardItemProps> = ({ className, screen, ...props }) => {
    return <div {...props} className={cx(className, "dash-item", "s-dash-item", screenClasses[screen])} />;
};
