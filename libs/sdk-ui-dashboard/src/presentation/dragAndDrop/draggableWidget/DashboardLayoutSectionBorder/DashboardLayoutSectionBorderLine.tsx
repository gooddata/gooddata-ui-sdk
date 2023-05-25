// (C) 2019-2022 GoodData Corporation
import React from "react";
import cx from "classnames";

import { DashboardLayoutSectionBorderMarker } from "./DashboardLayoutSectionBorderMarker.js";
import { DashboardLayoutSectionBorderStatus } from "./types.js";

interface IDashboardLayoutSectionBorderLineProps {
    position: "top" | "bottom";
    status: DashboardLayoutSectionBorderStatus;
}

export const DashboardLayoutSectionBorderLine: React.FC<IDashboardLayoutSectionBorderLineProps> = (props) => {
    const { position, status } = props;
    return (
        <div className={cx("gd-fluidlayout-row-separator", "s-fluidlayout-row-separator", position, status)}>
            <DashboardLayoutSectionBorderMarker
                className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-left"
                active={props.status === "active"}
            />
            <DashboardLayoutSectionBorderMarker
                className="gd-fluidlayout-row-separator-icon gd-fluidlayout-row-separator-icon-right"
                active={props.status === "active"}
            />
        </div>
    );
};
