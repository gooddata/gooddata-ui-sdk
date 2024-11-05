// (C) 2023-2024 GoodData Corporation
import React, { useEffect } from "react";
import cx from "classnames";

import {
    useDispatchDashboardCommand,
    changeFilterContextSelection,
    useWidgetSelection,
    useDashboardSelector,
    selectEnableFlexibleLayout,
} from "../../../model/index.js";
import { useDashboardDrop, useWidgetDragHoverHandlers } from "../../dragAndDrop/index.js";
import { DashboardLayout } from "../../layout/index.js";
import { IDashboardProps } from "../types.js";
import { DateFilterConfigWarnings } from "../components/DateFilterConfigWarnings.js";

/**
 * @internal
 */
export const DefaultDashboardMainContent = (_: IDashboardProps) => {
    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);
    const { deselectWidgets } = useWidgetSelection();

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

    const isFlexibleLayoutEnabled = useDashboardSelector(selectEnableFlexibleLayout);

    const classNames = cx("gd-flex-container", "root-flex-maincontent", {
        "gd-grid-layout": isFlexibleLayoutEnabled,
    });

    return (
        <div className={classNames} ref={dropRef} onClick={deselectWidgets}>
            <DateFilterConfigWarnings />
            <DashboardLayout onFiltersChange={onFiltersChange} />
        </div>
    );
};
