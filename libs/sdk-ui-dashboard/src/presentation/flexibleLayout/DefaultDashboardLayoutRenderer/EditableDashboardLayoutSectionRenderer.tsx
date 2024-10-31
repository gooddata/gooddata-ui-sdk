// (C) 2007-2024 GoodData Corporation
import React from "react";
import { IDashboardLayoutSectionRenderer } from "./interfaces.js";
import {
    DashboardLayoutSectionBorder,
    DashboardLayoutSectionBorderStatus,
    useIsDraggingWidget,
} from "../../dragAndDrop/index.js";
import { selectActiveSectionIndex, useDashboardSelector } from "../../../model/index.js";
import { GridLayoutElement } from "./GridLayoutElement.js";

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
    const { children, className, isHidden, section, screen, parentLayoutItemSize } = props;
    const style = isHidden ? isHiddenStyle : defaultStyle;
    const status = useBorderStatus(section.index());
    return (
        <GridLayoutElement
            type="section"
            screen={screen}
            layoutItemSize={parentLayoutItemSize}
            className={className}
            style={style}
        >
            <DashboardLayoutSectionBorder status={status}>{children}</DashboardLayoutSectionBorder>
        </GridLayoutElement>
    );
};
