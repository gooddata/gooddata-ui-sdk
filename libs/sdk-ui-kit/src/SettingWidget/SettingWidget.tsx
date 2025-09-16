// (C) 2022-2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";

/**
 * @internal
 */
export interface ISettingWidgetProps {
    className?: string;
    children?: ReactNode;
}

/**
 * @internal
 */
export function SettingWidget({ className, children }: ISettingWidgetProps) {
    return <div className={cx("gd-setting-widget", className)}>{children}</div>;
}
