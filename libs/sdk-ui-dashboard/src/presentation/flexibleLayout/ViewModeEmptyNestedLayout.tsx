// (C) 2022-2025 GoodData Corporation

import cx from "classnames";

import { useScreenSize } from "../dashboard/components/DashboardScreenSizeContext.js";
import { DashboardItem, DashboardItemBase } from "../presentationComponents/index.js";

/**
 * @internal
 */
export function ViewModeEmptyNestedLayout() {
    const screen = useScreenSize();
    return (
        <DashboardItem className={cx("gd-empty-nested-layout", "gd-dashboard-view-widget")} screen={screen}>
            <DashboardItemBase contentClassName={"gd-dashboard-nested-layout-content"}>
                {() => <div />}
            </DashboardItemBase>
        </DashboardItem>
    );
}
