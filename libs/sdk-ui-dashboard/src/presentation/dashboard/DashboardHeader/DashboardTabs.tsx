// (C) 2025 GoodData Corporation

import { ReactElement, useCallback, useMemo, useRef } from "react";

import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { IDashboardTab } from "@gooddata/sdk-model";
import { IUiTab, UiIcon, UiTabs } from "@gooddata/sdk-ui-kit";

import {
    ExtendedDashboardWidget,
    repositionDashboardTab,
    selectActiveTabId,
    selectEnableDashboardTabs,
    selectIsInEditMode,
    selectTabs,
    switchDashboardTab,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";

const EMPTY_TABS: IDashboardTab<ExtendedDashboardWidget>[] = [];

export function useDashboardTabsProps(): IDashboardTabsProps {
    const intl = useIntl();

    const enableDashboardTabs = useDashboardSelector(selectEnableDashboardTabs);
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const tabs = useDashboardSelector(selectTabs) ?? EMPTY_TABS;
    const activeTabId = useDashboardSelector(selectActiveTabId);
    const dispatch = useDashboardDispatch();

    // Generate a stable unique ID for the default tab
    const defaultTabIdRef = useRef<string>(uuid());

    const handleTabSelect = useCallback(
        (tab: IUiTab) => {
            if (tab.id !== activeTabId) {
                dispatch(switchDashboardTab(tab.id));
            }
        },
        [activeTabId, dispatch],
    );

    const uiTabs = useMemo<IUiTab[]>(() => {
        const mappedTabs = (tabs.map((tab, index) => ({
            id: tab.identifier,
            label: tab.title || intl.formatMessage({ id: "dashboard.tabs.default.label" }), // handles also empty string
            actions: isEditMode
                ? [
                      {
                          id: "moveLeft",
                          label: intl.formatMessage({ id: "dashboard.tabs.move.left" }),
                          iconLeft: <UiIcon type={"arrowLeft"} ariaHidden size={12} />,
                          onSelect: () => {
                              if (index <= 0) {
                                  return;
                              }

                              dispatch(repositionDashboardTab(index, index - 1));
                          },
                          isDisabled: index === 0,
                          closeOnSelect: false,
                      },
                      {
                          id: "moveRight",
                          label: intl.formatMessage({ id: "dashboard.tabs.move.right" }),
                          iconLeft: <UiIcon type={"arrowRight"} ariaHidden size={12} />,
                          onSelect: () => {
                              if (index >= tabs.length - 1) {
                                  return;
                              }

                              dispatch(repositionDashboardTab(index, index + 1));
                          },
                          isDisabled: index === tabs.length - 1,
                          closeOnSelect: false,
                      },
                  ]
                : [],
        })) ?? []) satisfies IUiTab[];

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
    }, [tabs, isEditMode, enableDashboardTabs, intl, dispatch]);

    // Use the default tab ID as activeTabId if we created a default tab and no activeTabId is set
    const effectiveActiveTabId = useMemo(() => {
        if (isEditMode && enableDashboardTabs && tabs.length === 0 && !activeTabId) {
            return defaultTabIdRef.current;
        }
        return activeTabId;
    }, [isEditMode, enableDashboardTabs, tabs, activeTabId]);

    return {
        enableDashboardTabs,
        activeTabId: effectiveActiveTabId,
        uiTabs,
        handleTabSelect,
    };
}

interface IDashboardTabsProps {
    enableDashboardTabs: boolean;
    activeTabId?: string;
    uiTabs: IUiTab[];
    handleTabSelect: (tab: IUiTab) => void;
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
                maxLabelLength={255}
            />
        </div>
    );
}
