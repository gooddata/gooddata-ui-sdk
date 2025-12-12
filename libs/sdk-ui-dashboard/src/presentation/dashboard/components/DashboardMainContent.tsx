// (C) 2022-2025 GoodData Corporation

import { type Ref, type RefObject, forwardRef, useEffect } from "react";

import cx from "classnames";

import { DateFilterConfigWarnings } from "./DateFilterConfigWarnings.js";
import {
    changeFilterContextSelection,
    useDispatchDashboardCommand,
    useWidgetSelection,
} from "../../../model/index.js";
import { useDashboardDrop } from "../../dragAndDrop/index.js";
import { useWidgetDragHoverHandlers as useFlexibleWidgetDragHoverHandlers } from "../../flexibleLayout/dragAndDrop/draggableWidget/useWidgetDragHoverHandlers.js";
import { DashboardLayout } from "../../widget/index.js";
import { type IDashboardProps } from "../types.js";

export const DashboardMainContent = forwardRef(function DashboardMainContent(_: IDashboardProps, ref) {
    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);
    const { deselectWidgets } = useWidgetSelection();
    const useWidgetDragHoverHandlers = useFlexibleWidgetDragHoverHandlers;
    const { handleDragHoverEnd } = useWidgetDragHoverHandlers();
    const [{ isOver }, dropRef] = useDashboardDrop(
        [
            "insight",
            "insight-placeholder",
            "insightListItem",
            "kpi",
            "kpi-placeholder",
            "richText",
            "richTextListItem",
            "visualizationSwitcher",
            "visualizationSwitcherListItem",
            "dashboardLayout",
            "dashboardLayoutListItem",
        ],
        {},
    );

    useEffect(() => {
        if (!isOver) {
            handleDragHoverEnd();
        }
    }, [handleDragHoverEnd, isOver]);

    const classNames = cx(
        "gd-flex-container",
        "root-flex-maincontent",
        "gd-grid-layout",
        "gd-auto-resized-dashboard-descriptions",
    );

    return (
        <div
            className="gd-flex-item-stretch dash-section dash-section-kpis"
            ref={ref as RefObject<HTMLDivElement>}
        >
            <div
                className={classNames}
                ref={dropRef as unknown as Ref<HTMLDivElement> | undefined}
                onClick={deselectWidgets}
            >
                <DateFilterConfigWarnings />
                <DashboardLayout onFiltersChange={onFiltersChange} />
            </div>
        </div>
    );
});
