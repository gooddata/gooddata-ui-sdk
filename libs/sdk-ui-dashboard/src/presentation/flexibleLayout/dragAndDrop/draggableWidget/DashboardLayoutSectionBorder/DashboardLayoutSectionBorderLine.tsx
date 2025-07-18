// (C) 2019-2025 GoodData Corporation
import cx from "classnames";
import { IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";

import { DashboardLayoutSectionBorderMarker } from "./DashboardLayoutSectionBorderMarker.js";
import { DashboardLayoutSectionBorderStatus } from "./types.js";
import { GridLayoutElement } from "../../../DefaultDashboardLayoutRenderer/GridLayoutElement.js";

interface IDashboardLayoutSectionBorderLineProps {
    position: "top" | "bottom";
    status: DashboardLayoutSectionBorderStatus;
    itemSize?: IDashboardLayoutSizeByScreenSize; // optional so I don't need to handle this in old layout yet
}

export function DashboardLayoutSectionBorderLine({
    position,
    status,
    itemSize,
}: IDashboardLayoutSectionBorderLineProps) {
    return (
        <GridLayoutElement
            type="item"
            layoutItemSize={itemSize}
            className={cx("gd-fluidlayout-row-separator", "s-fluidlayout-row-separator", position, status)}
        >
            <DashboardLayoutSectionBorderMarker
                className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-left"
                active={status === "active"}
            />
            <div className="gd-fluidlayout-row-separator-line" />
            <DashboardLayoutSectionBorderMarker
                className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-right"
                active={status === "active"}
            />
        </GridLayoutElement>
    );
}
