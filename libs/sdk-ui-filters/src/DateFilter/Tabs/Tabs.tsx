// (C) 2007-2019 GoodData Corporation
import React from "react";
import cx from "classnames";

interface ITabsWrapperProps {
    className?: string;
    children: React.ReactNode;
}

export const TabsWrapper: React.FC<ITabsWrapperProps> = ({ className, children, ...restProps }) => (
    <div className={cx("gd-tabs small is-condensed", className)} {...restProps}>
        {children}
    </div>
);

interface ITabProps {
    selected?: boolean;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

export const Tab: React.FC<ITabProps> = ({ selected, className, children, ...restProps }) => (
    <div className={cx(selected && "is-active", "gd-tab", className)} {...restProps}>
        {children}
    </div>
);
