// (C) 2025 GoodData Corporation

import { ReactElement, useCallback, useMemo, useRef } from "react";

import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { UiTab, UiTabs } from "@gooddata/sdk-ui-kit";

import {
    selectActiveTabId,
    selectEnableDashboardTabs,
    selectIsInEditMode,
    selectTabs,
    switchDashboardTab,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

export function useDashboardTabsProps(): IDashboardTabsProps {
    const intl = useIntl();

    const enableDashboardTabs = useDashboardSelector(selectEnableDashboardTabs);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const tabs = useDashboardSelector(selectTabs);
    const activeTabId = useDashboardSelector(selectActiveTabId);
    const dispatch = useDashboardDispatch();

    // Generate a stable unique ID for the default tab
    const defaultTabIdRef = useRef<string>(uuid());

    const handleTabSelect = useCallback(
        (tab: UiTab) => {
            if (tab.id !== activeTabId) {
                dispatch(switchDashboardTab(tab.id));
            }
        },
        [activeTabId, dispatch],
    );

    const uiTabs: UiTab[] = useMemo(() => {
        const mappedTabs =
            tabs?.map((tab) => ({
                id: tab.identifier,
                label: tab.title || intl.formatMessage({ id: "dashboard.tabs.default.label" }), // handles also empty string
            })) ?? [];

        // In edit mode, if tabs feature is enabled but no tabs exist, create a default "Untitled" tab
        if (isEditMode && enableDashboardTabs && mappedTabs.length === 0) {
            return [
                {
                    id: defaultTabIdRef.current,
                    label: intl.formatMessage({ id: "dashboard.tabs.default.label" }),
                },
            ];
        }

        return mappedTabs;
    }, [tabs, isEditMode, enableDashboardTabs, intl]);

    // Use the default tab ID as activeTabId if we created a default tab and no activeTabId is set
    const effectiveActiveTabId = useMemo(() => {
        if (isEditMode && enableDashboardTabs && (!tabs || tabs.length === 0) && !activeTabId) {
            return defaultTabIdRef.current;
        }
        return activeTabId;
    }, [isEditMode, enableDashboardTabs, tabs, activeTabId]);

    return {
        enableDashboardTabs,
        activeTabId: effectiveActiveTabId,
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
    const intl = useIntl();
    const isEditMode = useDashboardSelector(selectIsInEditMode);

    const ACCESSIBILITY_CONFIG = useMemo(
        () => ({
            role: "tablist",
            tabRole: "tab",
            ariaLabel: intl.formatMessage({ id: "dashboard.tabs.accessibility.label" }),
        }),
        [intl],
    );

    const shouldHideTabs = useMemo(() => {
        if (!enableDashboardTabs || !uiTabs || activeTabId === undefined) {
            return true;
        }
        return isEditMode ? uiTabs.length < 1 : uiTabs.length <= 1;
    }, [isEditMode, enableDashboardTabs, uiTabs, activeTabId]);

    if (shouldHideTabs) {
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
