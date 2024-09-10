// (C) 2007-2024 GoodData Corporation
import React from "react";
import { IDashboardLayoutSectionRenderer } from "./interfaces.js";
// import cx from "classnames";

// const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
// const defaultStyle = {};

export const DashboardLayoutSectionRenderer: IDashboardLayoutSectionRenderer<unknown> = (props) => {
    const { children /*, className, debug, isHidden*/ } = props;

    // const style = isHidden ? isHiddenStyle : defaultStyle;
    // console.log("XXXX DashboardLayoutSectionRenderer")

    // TODO move the functionality to widget itself, no wrapper here to fuck up the grid
    return (
        // <div
        //     className={cx(["gd-fluidlayout-row", "s-fluid-layout-row", className], {
        //         "gd-fluidlayout-row-debug": debug,
        //     })}
        //     style={style}
        // >
        <>{children}</>
        // </div>
    );
};
