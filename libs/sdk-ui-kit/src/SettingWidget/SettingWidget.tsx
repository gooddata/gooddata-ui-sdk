// (C) 2022-2025 GoodData Corporation
import cx from "classnames";
import { ReactNode } from "react";

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
