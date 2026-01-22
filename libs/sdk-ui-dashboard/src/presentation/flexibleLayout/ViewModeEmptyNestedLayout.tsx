// (C) 2022-2026 GoodData Corporation

import cx from "classnames";

import { useScreenSize } from "../dashboard/components/DashboardScreenSizeContext.js";
import { DashboardItem } from "../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemBase } from "../presentationComponents/DashboardItems/DashboardItemBase.js";

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
