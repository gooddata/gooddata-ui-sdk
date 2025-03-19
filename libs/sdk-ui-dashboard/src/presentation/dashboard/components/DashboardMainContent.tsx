// (C) 2022-2025 GoodData Corporation
import React, { forwardRef, RefObject, useEffect } from "react";
import cx from "classnames";

import {
    useDispatchDashboardCommand,
    changeFilterContextSelection,
    useWidgetSelection,
    useDashboardSelector,
    selectEnableFlexibleLayout,
    selectEnableDashboardDescriptionDynamicHeight,
} from "../../../model/index.js";
import { useDashboardDrop } from "../../dragAndDrop/index.js";
import { DashboardLayout } from "../../layout/index.js";
import { IDashboardProps } from "../types.js";

import { DateFilterConfigWarnings } from "./DateFilterConfigWarnings.js";
import { useWidgetDragHoverHandlers as useFlexibleWidgetDragHoverHandlers } from "../../flexibleLayout/dragAndDrop/draggableWidget/useWidgetDragHoverHandlers.js";
import { useWidgetDragHoverHandlers as useFluidWidgetDragHoverHandlers } from "../../layout/dragAndDrop/draggableWidget/useWidgetDragHoverHandlers.js";

export const DashboardMainContent = forwardRef(function DashboardMainContent(_: IDashboardProps, ref) {
    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);
    const { deselectWidgets } = useWidgetSelection();
    const isFlexibleLayoutEnabled = useDashboardSelector(selectEnableFlexibleLayout);
    const isDescriptionDynamicHeight = useDashboardSelector(selectEnableDashboardDescriptionDynamicHeight);
    const useWidgetDragHoverHandlers = isFlexibleLayoutEnabled
        ? useFlexibleWidgetDragHoverHandlers
        : useFluidWidgetDragHoverHandlers;

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

    const classNames = cx("gd-flex-container", "root-flex-maincontent", {
        "gd-grid-layout": isFlexibleLayoutEnabled,
        "gd-auto-resized-dashboard-descriptions": isFlexibleLayoutEnabled || isDescriptionDynamicHeight,
    });

    return (
        <div
            className="gd-flex-item-stretch dash-section dash-section-kpis"
            ref={ref as RefObject<HTMLDivElement>}
        >
            <div className={classNames} ref={dropRef} onClick={deselectWidgets}>
                <DateFilterConfigWarnings />
                <DashboardLayout onFiltersChange={onFiltersChange} />
            </div>
        </div>
    );
});
