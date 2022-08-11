// (C) 2020-2022 GoodData Corporation
import React from "react";
import { ObjRef } from "@gooddata/sdk-model";
import { selectAccessibleDashboards, useDashboardSelector } from "../../../../../model";
import { DashboardList, IDrillableDashboardListItem } from "../../../../dashboardList";

interface IDrillTargetDashboardItemProps {
    selected?: ObjRef;
    onSelect: (targetItem: IDrillableDashboardListItem) => void;
}

export const DrillTargetDashboardItem: React.FunctionComponent<IDrillTargetDashboardItemProps> = (props) => {
    const { onSelect, selected } = props;

    const dashboards = useDashboardSelector(selectAccessibleDashboards);

    return <DashboardList onSelect={onSelect} dashboards={dashboards} selected={selected} />;
};
