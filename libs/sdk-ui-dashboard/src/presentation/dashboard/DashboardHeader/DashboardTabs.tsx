// (C) 2025 GoodData Corporation

import { ReactElement, useCallback, useMemo } from "react";

import { UiTab, UiTabs } from "@gooddata/sdk-ui-kit";

import {
    selectActiveTabId,
    selectEnableDashboardTabs,
    selectTabs,
    switchDashboardTab,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

const ACCESSIBILITY_CONFIG = {
    role: "tablist",
    tabRole: "tab",
    ariaLabel: "Dashboard tabs",
} as const;

export function useDashboardTabsProps(): IDashboardTabsProps {
    const enableDashboardTabs = useDashboardSelector(selectEnableDashboardTabs);
    const tabs = useDashboardSelector(selectTabs);
    const activeTabId = useDashboardSelector(selectActiveTabId);
    const dispatch = useDashboardDispatch();

    const handleTabSelect = useCallback(
        (tab: UiTab) => {
            if (tab.id !== activeTabId) {
                dispatch(switchDashboardTab(tab.id));
            }
        },
        [activeTabId, dispatch],
    );

    const uiTabs: UiTab[] = useMemo(
        () =>
            tabs?.map((tab) => ({
                id: tab.identifier,
                label: tab.title || tab.identifier, // Fallback to identifier if title is empty
            })) ?? [],
        [tabs],
    );
    return {
        enableDashboardTabs,
        activeTabId,
        uiTabs,
        handleTabSelect: handleTabSelect,
    };
}

interface IDashboardTabsProps {
    enableDashboardTabs: boolean;
    activeTabId?: string;
    uiTabs: UiTab[];
    handleTabSelect: (tab: UiTab) => void;
}
/**
 * @internal
 */
export function DashboardTabs({
    enableDashboardTabs,
    activeTabId,
    uiTabs,
    handleTabSelect,
}: IDashboardTabsProps): ReactElement | null {
    if (!enableDashboardTabs || !uiTabs || uiTabs.length === 0) {
        return null;
    }

    if (!activeTabId) {
        return null;
    }

    return (
        <div className="gd-dash-tabs-bar">
            <UiTabs
                size="large"
                tabs={uiTabs}
                onTabSelect={handleTabSelect}
                selectedTabId={activeTabId ?? uiTabs[0].id}
                accessibilityConfig={ACCESSIBILITY_CONFIG}
                enableOverflowDropdown
                maxLabelLength={255}
            />
        </div>
    );
}
