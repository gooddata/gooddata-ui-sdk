// (C) 2007-2022 GoodData Corporation
import React from "react";
import { IDashboardLayoutSectionRenderer } from "./interfaces";
import cx from "classnames";
import { DashboardLayoutSectionBorder } from "../../dragAndDrop/draggableWidget/DashboardLayoutSectionBorder";
import { DashboardLayoutSectionBorderStatus } from "../../dragAndDrop/draggableWidget/DashboardLayoutSectionBorder/types";
import { selectIsDraggingWidget, useDashboardSelector } from "../../../model";
import { RenderMode } from "../../../types";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

function useBorderStatus(renderMode: RenderMode): DashboardLayoutSectionBorderStatus {
    const isDraggingWidget = useDashboardSelector(selectIsDraggingWidget);
    if (!isDraggingWidget || renderMode === "view") {
        return "invisible";
    }

    return "muted"; // TODO activation by editable header activation, maybe split this component into two?
}

export const DashboardLayoutSectionRenderer: IDashboardLayoutSectionRenderer<unknown> = (props) => {
    const { children, className, debug, isHidden, renderMode } = props;

    const style = isHidden ? isHiddenStyle : defaultStyle;
    const status = useBorderStatus(renderMode);

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
