// (C) 2019-2022 GoodData Corporation
import React from "react";
import cx from "classnames";

import { DashboardEditLayoutSectionBorderMarker } from "./DashboardEditLayoutSectionBorderMarker.js";

export type DashboardEditLayoutSectionBorderStatus = "active" | "muted" | "invisible";

interface IDashboardEditLayoutSectionBorderProps {
    children?: React.ReactNode;
    status: DashboardEditLayoutSectionBorderStatus;
}

export const DashboardEditLayoutSectionBorder: React.FunctionComponent<
    IDashboardEditLayoutSectionBorderProps
> = (props) => (
    <React.Fragment>
        <div className={classNames("top", props.status)}>
            <DashboardEditLayoutSectionBorderMarker
                className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-left"
                active={props.status === "active"}
            />
            <DashboardEditLayoutSectionBorderMarker
                className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-right"
                active={props.status === "active"}
            />
        </div>
        {props.children}
        <div className={classNames("bottom", props.status)}>
            <DashboardEditLayoutSectionBorderMarker
                className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-left"
                active={props.status === "active"}
            />
            <DashboardEditLayoutSectionBorderMarker
                className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-right"
                active={props.status === "active"}
            />
        </div>
    </React.Fragment>
);

type DashboardEditLayoutSectionBorderPosition = "top" | "bottom";

function classNames(
    position: DashboardEditLayoutSectionBorderPosition,
    status: DashboardEditLayoutSectionBorderStatus,
) {
    return cx("gd-fluidlayout-row-separator", "s-fluidlayout-row-separator", position, status);
}
