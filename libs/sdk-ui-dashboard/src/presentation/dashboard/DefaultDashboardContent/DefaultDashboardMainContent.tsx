// (C) 2023-2025 GoodData Corporation
import React, { useEffect } from "react";
import cx from "classnames";

import {
    useDispatchDashboardCommand,
    changeFilterContextSelection,
    useWidgetSelection,
    useDashboardSelector,
    selectEnableFlexibleLayout,
    selectEnableDashboardDescriptionDynamicHeight,
    selectRenderMode,
} from "../../../model/index.js";
import { useDashboardDrop } from "../../dragAndDrop/index.js";
import { DashboardLayout } from "../../layout/index.js";
import { IDashboardProps } from "../types.js";
import { DateFilterConfigWarnings } from "../components/DateFilterConfigWarnings.js";
import { useWidgetDragHoverHandlers as useFlexibleWidgetDragHoverHandlers } from "../../flexibleLayout/dragAndDrop/draggableWidget/useWidgetDragHoverHandlers.js";
import { useWidgetDragHoverHandlers as useFluidWidgetDragHoverHandlers } from "../../layout/dragAndDrop/draggableWidget/useWidgetDragHoverHandlers.js";
import { ExportThemeProvider } from "../../export/index.js";

/**
 * @internal
 */
export const DefaultDashboardMainContent = (_: IDashboardProps) => {
    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);
    const { deselectWidgets } = useWidgetSelection();
    const isFlexibleLayoutEnabled = useDashboardSelector(selectEnableFlexibleLayout);
    const isDescriptionDynamicHeight = useDashboardSelector(selectEnableDashboardDescriptionDynamicHeight);
    const useWidgetDragHoverHandlers = isFlexibleLayoutEnabled
        ? useFlexibleWidgetDragHoverHandlers
        : useFluidWidgetDragHoverHandlers;

    const renderMode = useDashboardSelector(selectRenderMode);

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
        "gd-fluid-layout": !isFlexibleLayoutEnabled,
        "gd-grid-layout": isFlexibleLayoutEnabled,
        "gd-auto-resized-dashboard-descriptions": isFlexibleLayoutEnabled || isDescriptionDynamicHeight,
    });

    const renderContent = () => {
        return (
            <div className={classNames} ref={dropRef} onClick={deselectWidgets}>
                <DateFilterConfigWarnings />
                <DashboardLayout onFiltersChange={onFiltersChange} />
            </div>
        );
    };

    if (renderMode === "export") {
        return <ExportThemeProvider>{renderContent()}</ExportThemeProvider>;
    }

    return renderContent();
};
