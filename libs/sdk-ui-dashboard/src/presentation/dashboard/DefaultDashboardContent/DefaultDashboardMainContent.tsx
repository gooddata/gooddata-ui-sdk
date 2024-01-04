// (C) 2023 GoodData Corporation
import React, { useEffect } from "react";
import {
    useDispatchDashboardCommand,
    changeFilterContextSelection,
    useWidgetSelection,
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
        ["insight", "insight-placeholder", "insightListItem", "kpi", "kpi-placeholder"],
        {},
    );

    useEffect(() => {
        if (!isOver) {
            handleDragHoverEnd();
        }
    }, [handleDragHoverEnd, isOver]);

    return (
        <div className="gd-flex-container root-flex-maincontent" ref={dropRef} onClick={deselectWidgets}>
            <DateFilterConfigWarnings />
            <DashboardLayout onFiltersChange={onFiltersChange} />
        </div>
    );
};
