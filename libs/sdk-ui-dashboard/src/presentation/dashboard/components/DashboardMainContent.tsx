// (C) 2022 GoodData Corporation
import React from "react";
import {
    useDispatchDashboardCommand,
    changeFilterContextSelection,
    useWidgetSelection,
} from "../../../model";
import { DashboardLayout } from "../../layout";
import { IDashboardProps } from "../types";
import { DateFilterConfigWarnings } from "./DateFilterConfigWarnings";

export const DashboardMainContent: React.FC<IDashboardProps> = () => {
    const onFiltersChange = useDispatchDashboardCommand(changeFilterContextSelection);
    const { deselectWidgets } = useWidgetSelection();

    return (
        <div className="gd-flex-item-stretch dash-section dash-section-kpis">
            <div className="gd-flex-container root-flex-maincontent" onClick={deselectWidgets}>
                <DateFilterConfigWarnings />
                <DashboardLayout onFiltersChange={onFiltersChange} />
            </div>
        </div>
    );
};
