// (C) 2007-2020 GoodData Corporation
import React from "react";
import { IDashboardLayoutSectionRenderer } from "./interfaces";
import { Row } from "react-grid-system";
import cx from "classnames";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

export const DashboardLayoutSectionRenderer: IDashboardLayoutSectionRenderer<unknown> = (props) => {
    const { children, className, debug, isHidden } = props;

    const style = isHidden ? isHiddenStyle : defaultStyle;

    return (
        <Row
            className={cx(["gd-fluidlayout-row", "s-fluid-layout-row", className], {
                "gd-fluidlayout-row-debug": debug,
            })}
            style={style}
        >
            {children}
        </Row>
    );
};
