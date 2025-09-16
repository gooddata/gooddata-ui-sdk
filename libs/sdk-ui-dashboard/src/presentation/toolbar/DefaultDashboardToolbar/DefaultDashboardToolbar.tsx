// (C) 2022-2025 GoodData Corporation

import { IToolbarProps } from "../types.js";

/**
 * @internal
 */
export function DefaultDashboardToolbar(props: IToolbarProps) {
    const { children } = props;
    return <div className="gd-dashboard-toolbar s-dashboard-toolbar">{children}</div>;
}
