// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IDashboardLayoutSectionRenderer } from "./interfaces";
import cx from "classnames";
import {
    DashboardLayoutSectionBorder,
    DashboardLayoutSectionBorderStatus,
    useIsDraggingWidget,
} from "../../dragAndDrop";
import { selectActiveSectionIndex, useDashboardSelector } from "../../../model";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

function useBorderStatus(sectionIndex: number): DashboardLayoutSectionBorderStatus {
    const activeSectionIndex = useDashboardSelector(selectActiveSectionIndex);
    const isDraggingWidget = useIsDraggingWidget();
    if (isDraggingWidget) {
        return "muted";
    }

    const isActive = activeSectionIndex === sectionIndex;
    return !isActive ? "invisible" : "muted";
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
