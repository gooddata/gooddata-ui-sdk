// (C) 2007-2025 GoodData Corporation
import React from "react";
import cx from "classnames";

import { IDashboardLayoutSectionRenderer } from "./interfaces.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

export const ExportableDashboardLayoutSectionRenderer: IDashboardLayoutSectionRenderer<unknown> = (props) => {
    const { children, className, debug, isHidden, exportData, exportStyles } = props;
    const style = isHidden ? isHiddenStyle : defaultStyle;

    return (
        <div
            className={cx(["gd-fluidlayout-row", "s-fluid-layout-row", className], {
                "gd-fluidlayout-row-debug": debug,
            })}
            style={{
                ...style,
                ...exportStyles,
            }}
            {...exportData}
        >
            {children}
        </div>
    );
};
