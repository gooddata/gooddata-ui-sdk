// (C) 2007-2025 GoodData Corporation

import { GridLayoutElement } from "./GridLayoutElement.js";
import { IDashboardLayoutSectionRenderProps } from "./interfaces.js";
import { IDashboardLayoutSectionFacade } from "../../../_staging/dashboard/flexibleLayout/index.js";
import { areSectionLayoutPathsEqual } from "../../../_staging/layout/coordinates.js";
import { selectActiveSection, useDashboardSelector } from "../../../model/index.js";
import { useIsDraggingWidget } from "../../dragAndDrop/draggableWidget/useIsDraggingWidget.js";
import {
    DashboardLayoutSectionBorder,
    DashboardLayoutSectionBorderStatus,
} from "../dragAndDrop/draggableWidget/DashboardLayoutSectionBorder/index.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

function useBorderStatus(section: IDashboardLayoutSectionFacade<unknown>): {
    status: DashboardLayoutSectionBorderStatus;
    renderBottomBorder?: boolean;
} {
    const activeSection = useDashboardSelector(selectActiveSection);
    const isDraggingWidget = useIsDraggingWidget();
    if (isDraggingWidget) {
        return { status: "muted", renderBottomBorder: section.isLast() };
    }
    const isActive = areSectionLayoutPathsEqual(activeSection, section.index());
    return isActive ? { status: "muted", renderBottomBorder: true } : { status: "invisible" };
}

export function EditableDashboardLayoutSectionRenderer({
    children,
    className,
    isHidden,
    section,
    parentLayoutItemSize,
    showBorders,
}: IDashboardLayoutSectionRenderProps<unknown & object>) {
    const style = isHidden ? isHiddenStyle : defaultStyle;
    const { status, renderBottomBorder } = useBorderStatus(section);
    return (
        <GridLayoutElement
            type="section"
            layoutItemSize={parentLayoutItemSize}
            className={className}
            style={style}
        >
            {showBorders ? (
                <DashboardLayoutSectionBorder
                    status={status}
                    renderBottomBorder={renderBottomBorder}
                    itemSize={parentLayoutItemSize}
                >
                    {children}
                </DashboardLayoutSectionBorder>
            ) : (
                children
            )}
        </GridLayoutElement>
    );
}
