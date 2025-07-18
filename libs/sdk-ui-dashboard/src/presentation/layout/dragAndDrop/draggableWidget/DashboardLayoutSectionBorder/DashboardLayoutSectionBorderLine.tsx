// (C) 2019-2025 GoodData Corporation
import cx from "classnames";

import { DashboardLayoutSectionBorderMarker } from "./DashboardLayoutSectionBorderMarker.js";
import { DashboardLayoutSectionBorderStatus } from "./types.js";

interface IDashboardLayoutSectionBorderLineProps {
    position: "top" | "bottom";
    status: DashboardLayoutSectionBorderStatus;
}

export function DashboardLayoutSectionBorderLine({
    position,
    status,
}: IDashboardLayoutSectionBorderLineProps) {
    return (
        <div className={cx("gd-fluidlayout-row-separator", "s-fluidlayout-row-separator", position, status)}>
            <DashboardLayoutSectionBorderMarker
                className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-left"
                active={status === "active"}
            />
            <DashboardLayoutSectionBorderMarker
                className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-right"
                active={status === "active"}
            />
        </div>
    );
}
