// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";

/**
 * @internal
 */
export interface ISettingWidgetProps {
    className?: string;
}

/**
 * @internal
 */
export const SettingWidget: React.FC<ISettingWidgetProps> = ({ className, children }) => (
    <div className={cx("gd-setting-widget", className)}>{children}</div>
);
