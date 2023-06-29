// (C) 2020-2023 GoodData Corporation
import React, { useMemo } from "react";
import { IntlShape, useIntl } from "react-intl";
import { IListedDashboard, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import {
    IInaccessibleDashboard,
    selectAccessibleDashboards,
    selectInaccessibleDashboards,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { DashboardList, IDrillableDashboardListItem } from "../../../../dashboardList/index.js";

interface IDrillTargetDashboardItemProps {
    selected?: ObjRef;
    onSelect: (targetItem: IDrillableDashboardListItem) => void;
}

const buildDashboardItems = (
    dashboards: IListedDashboard[],
    forbiddenDashboards: IInaccessibleDashboard[],
    intl: IntlShape,
    selected?: ObjRef,
) => {
    const isAvailableDashboardSelected = dashboards.some((dashboard) =>
        areObjRefsEqual(dashboard.ref, selected),
    );

    if (!selected || isAvailableDashboardSelected) {
        return dashboards;
    }

    const selectedForbiddenItem = forbiddenDashboards.find(({ ref }) => areObjRefsEqual(ref, selected));

    if (selectedForbiddenItem === undefined) {
        return dashboards;
    }

    const { title, accessibilityLimitation } = selectedForbiddenItem;
    const forbiddenItem: IDrillableDashboardListItem = {
        ...selectedForbiddenItem,
        title:
            accessibilityLimitation === "forbidden"
                ? intl.formatMessage({ id: "configurationPanel.drillConfig.forbiddenDashboard" })
                : title,
    };
    return [forbiddenItem, ...dashboards];
};

export const DrillTargetDashboardItem: React.FunctionComponent<IDrillTargetDashboardItemProps> = (props) => {
    const { onSelect, selected } = props;
    const intl = useIntl();
    const dashboards = useDashboardSelector(selectAccessibleDashboards);
    const inaccessibleDashboards = useDashboardSelector(selectInaccessibleDashboards);
    const dashboardItems = useMemo(() => {
        return buildDashboardItems(dashboards, inaccessibleDashboards, intl, selected);
    }, [dashboards, inaccessibleDashboards, intl, selected]);

    return <DashboardList onSelect={onSelect} dashboards={dashboardItems} selected={selected} />;
};
