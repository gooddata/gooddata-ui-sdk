// (C) 2019-2025 GoodData Corporation
import { ReactNode } from "react";
import cx from "classnames";

import { DashboardEditLayoutSectionBorderMarker } from "./DashboardEditLayoutSectionBorderMarker.js";

export type DashboardEditLayoutSectionBorderStatus = "active" | "muted" | "invisible";

interface IDashboardEditLayoutSectionBorderProps {
    children?: ReactNode;
    status: DashboardEditLayoutSectionBorderStatus;
}

export function DashboardEditLayoutSectionBorder({
    children,
    status,
}: IDashboardEditLayoutSectionBorderProps) {
    return (
        <>
            <div className={classNames("top", status)}>
                <DashboardEditLayoutSectionBorderMarker
                    className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-left"
                    active={status === "active"}
                />
                <DashboardEditLayoutSectionBorderMarker
                    className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-right"
                    active={status === "active"}
                />
            </div>
            {children}
            <div className={classNames("bottom", status)}>
                <DashboardEditLayoutSectionBorderMarker
                    className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-left"
                    active={status === "active"}
                />
                <DashboardEditLayoutSectionBorderMarker
                    className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-right"
                    active={status === "active"}
                />
            </div>
        </>
    );
}

type DashboardEditLayoutSectionBorderPosition = "top" | "bottom";

function classNames(
    position: DashboardEditLayoutSectionBorderPosition,
    status: DashboardEditLayoutSectionBorderStatus,
) {
    return cx("gd-fluidlayout-row-separator", "s-fluidlayout-row-separator", position, status);
}
