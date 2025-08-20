// (C) 2007-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { IDashboardLayoutSectionRenderer } from "./interfaces.js";
import { selectActiveSection, useDashboardSelector } from "../../../model/index.js";
import { useIsDraggingWidget } from "../../dragAndDrop/index.js";
import {
    DashboardLayoutSectionBorder,
    DashboardLayoutSectionBorderStatus,
} from "../dragAndDrop/draggableWidget/DashboardLayoutSectionBorder/index.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

function useBorderStatus(sectionIndex: number): DashboardLayoutSectionBorderStatus {
    const activeSection = useDashboardSelector(selectActiveSection);
    const isDraggingWidget = useIsDraggingWidget();
    if (isDraggingWidget) {
        return "muted";
    }

    const isActive = activeSection?.sectionIndex === sectionIndex;
    return isActive ? "muted" : "invisible";
}

export const EditableDashboardLayoutSectionRenderer: IDashboardLayoutSectionRenderer<unknown> = (props) => {
    const { children, className, debug, isHidden, section } = props;

    const style = isHidden ? isHiddenStyle : defaultStyle;
    const status = useBorderStatus(section.index());

    return (
        <div
            className={cx(["gd-fluidlayout-row", "s-fluid-layout-row", className], {
                "gd-fluidlayout-row-debug": debug,
            })}
            style={style}
        >
            <DashboardLayoutSectionBorder status={status}>{children}</DashboardLayoutSectionBorder>
        </div>
    );
};
