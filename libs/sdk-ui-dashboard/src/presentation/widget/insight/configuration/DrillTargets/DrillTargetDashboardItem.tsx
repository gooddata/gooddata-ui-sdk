// (C) 2020-2025 GoodData Corporation

import { useMemo } from "react";

import { IntlShape, useIntl } from "react-intl";

import { IListedDashboard, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { DrillTargetDashboardTabSelector } from "./DrillTargetDashboardTabSelector.js";
import {
    IInaccessibleDashboard,
    selectAccessibleDashboards,
    selectEnableDashboardTabs,
    selectInaccessibleDashboards,
    useDashboardSelector,
} from "../../../../../model/index.js";
import { DashboardList, IDrillableDashboardListItem } from "../../../../dashboardList/index.js";

interface IDrillTargetDashboardItemProps {
    selected?: ObjRef;
    selectedTab?: string;
    onSelect: (targetItem: IDrillableDashboardListItem, selectedTab?: string) => void;
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

export function DrillTargetDashboardItem({
    onSelect,
    selected,
    selectedTab,
}: IDrillTargetDashboardItemProps) {
    const intl = useIntl();
    const dashboards = useDashboardSelector(selectAccessibleDashboards);
    const inaccessibleDashboards = useDashboardSelector(selectInaccessibleDashboards);
    const enableDashboardTabs = useDashboardSelector(selectEnableDashboardTabs);

    const dashboardItems = useMemo(() => {
        return buildDashboardItems(dashboards, inaccessibleDashboards, intl, selected);
    }, [dashboards, inaccessibleDashboards, intl, selected]);

    // Find the selected dashboard and check if it has tabs
    const selectedDashboard = useMemo(() => {
        return selected ? dashboardItems.find((item) => areObjRefsEqual(item.ref, selected)) : undefined;
    }, [dashboardItems, selected]);

    // Check if selected dashboard has tabs (tabs property exists on dashboard items)
    const dashboardTabs = useMemo(() => {
        return selectedDashboard?.tabs || [];
    }, [selectedDashboard]);

    const handleTabSelect = (tabId: string | undefined) => {
        if (selectedDashboard) {
            onSelect(selectedDashboard, tabId);
        }
    };

    const handleDashboardSelect = (dashboard: IDrillableDashboardListItem) => {
        // Check if this dashboard has tabs
        const dashboardWithTabs = dashboards.find((d) => areObjRefsEqual(d.ref, dashboard.ref));
        const tabs = dashboardWithTabs?.tabs || [];

        // If dashboard has tabs, default to first tab, otherwise no tab
        const defaultTabId = tabs.length > 0 ? tabs[0].localIdentifier : undefined;
        onSelect(dashboard, defaultTabId);
    };

    // Get the effective selected tab (use provided or default to first tab)
    const effectiveSelectedTab =
        selectedTab || (dashboardTabs.length > 0 ? dashboardTabs[0]?.localIdentifier : undefined);

    return (
        <>
            <DashboardList onSelect={handleDashboardSelect} dashboards={dashboardItems} selected={selected} />
            {selected && dashboardTabs.length > 0 && enableDashboardTabs ? (
                <DrillTargetDashboardTabSelector
                    tabs={dashboardTabs}
                    selectedTabId={effectiveSelectedTab}
                    onSelect={handleTabSelect}
                />
            ) : null}
        </>
    );
}
