// (C) 2022 GoodData Corporation
import React, { useMemo } from "react";
import {
    useDashboardSelector,
    selectFilterBarExpanded,
    selectFilterBarHeight,
    useDispatchDashboardCommand,
    changeFilterContextSelection,
} from "../../../model";
import { DEFAULT_FILTER_BAR_HEIGHT } from "../../constants";
import { DashboardLayout } from "../../layout";
import { IDashboardProps } from "../types";
import { DateFilterConfigWarnings } from "./DateFilterConfigWarnings";

export const DashboardMainContent: React.FC<IDashboardProps> = () => {
    const isFilterBarExpanded = useDashboardSelector(selectFilterBarExpanded);
    const filterBarHeight = useDashboardSelector(selectFilterBarHeight);

    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);

    const dashSectionStyles = useMemo(
        () => ({
            marginTop: isFilterBarExpanded ? filterBarHeight - DEFAULT_FILTER_BAR_HEIGHT + "px" : undefined,
            transition: "margin-top 0.2s",
        }),
        [isFilterBarExpanded, filterBarHeight],
    );

    return (
        <div className="gd-flex-item-stretch dash-section dash-section-kpis" style={dashSectionStyles}>
            <div className="gd-flex-container root-flex-maincontent">
                <DateFilterConfigWarnings />
                <DashboardLayout onFiltersChange={onFiltersChange} />
            </div>
        </div>
    );
};
