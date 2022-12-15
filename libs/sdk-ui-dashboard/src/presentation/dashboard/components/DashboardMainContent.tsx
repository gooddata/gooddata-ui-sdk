// (C) 2022 GoodData Corporation
import React, { forwardRef, RefObject, useEffect } from "react";
import {
    useDispatchDashboardCommand,
    changeFilterContextSelection,
    useWidgetSelection,
} from "../../../model";
import { useDashboardDrop, useWidgetDragHoverHandlers } from "../../dragAndDrop";
import { DashboardLayout } from "../../layout";
import { IDashboardProps } from "../types";
import { DateFilterConfigWarnings } from "./DateFilterConfigWarnings";

export const DashboardMainContent = forwardRef(function DashboardMainContent(_: IDashboardProps, ref) {
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
        <div
            className="gd-flex-item-stretch dash-section dash-section-kpis"
            ref={ref as RefObject<HTMLDivElement>}
        >
            <div className="gd-flex-container root-flex-maincontent" ref={dropRef} onClick={deselectWidgets}>
                <DateFilterConfigWarnings />
                <DashboardLayout onFiltersChange={onFiltersChange} />
            </div>
        </div>
    );
});
