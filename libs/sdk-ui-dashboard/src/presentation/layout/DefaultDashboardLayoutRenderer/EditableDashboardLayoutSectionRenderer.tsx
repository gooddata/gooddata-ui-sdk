// (C) 2007-2025 GoodData Corporation
import { IDashboardLayoutSectionRenderProps } from "./interfaces.js";
import cx from "classnames";
import { useDashboardSelector, selectActiveSection } from "../../../model/index.js";
import {
    DashboardLayoutSectionBorderStatus,
    DashboardLayoutSectionBorder,
} from "../dragAndDrop/draggableWidget/DashboardLayoutSectionBorder/index.js";
import { useIsDraggingWidget } from "../../dragAndDrop/index.js";

const isHiddenStyle = { height: 0, width: 0, overflow: "hidden", flex: 0 };
const defaultStyle = {};

function useBorderStatus(sectionIndex: number): DashboardLayoutSectionBorderStatus {
    const activeSection = useDashboardSelector(selectActiveSection);
    const isDraggingWidget = useIsDraggingWidget();
    if (isDraggingWidget) {
        return "muted";
    }

    const isActive = activeSection?.sectionIndex === sectionIndex;
    return !isActive ? "invisible" : "muted";
}

export function EditableDashboardLayoutSectionRenderer({
    children,
    className,
    debug,
    isHidden,
    section,
}: IDashboardLayoutSectionRenderProps<unknown>) {
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
}
