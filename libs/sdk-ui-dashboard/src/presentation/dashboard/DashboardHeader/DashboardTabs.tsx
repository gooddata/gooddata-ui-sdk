// (C) 2025 GoodData Corporation

import { ReactElement, useCallback, useMemo, useRef } from "react";

import { useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

import { IDashboardTab } from "@gooddata/sdk-model";
import { IUiTab, UiIcon, UiIconButton, UiTabs, bemFactory, separatorStaticItem } from "@gooddata/sdk-ui-kit";

import {
    ExtendedDashboardWidget,
    createDashboardTab,
    deleteDashboardTab,
    repositionDashboardTab,
    selectActiveTabLocalIdentifier,
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
    const activeTabLocalIdentifier = useDashboardSelector(selectActiveTabLocalIdentifier);
    const dispatch = useDashboardDispatch();

    // Generate a stable unique ID for the default tab
    const defaultTabIdRef = useRef<string>(uuid());

    const handleTabSelect = useCallback(
        (tab: IUiTab) => {
            if (tab.id !== activeTabLocalIdentifier) {
                dispatch(switchDashboardTab(tab.id));
            }
        },
        [activeTabLocalIdentifier, dispatch],
    );

    const uiTabs = useMemo<IUiTab[]>(() => {
        const isOnlyOneTab = tabs.length < 2;

        const mappedTabs =
            tabs.map(
                (tab, index) =>
                    ({
                        id: tab.localIdentifier,
                        label: tab.title || intl.formatMessage({ id: "dashboard.tabs.default.label" }), // handles also empty string
                        actions: isEditMode
                            ? [
                                  index > 0 && {
                                      id: "moveLeft",
                                      label: intl.formatMessage({ id: "dashboard.tabs.move.left" }),
                                      iconLeft: <UiIcon type={"arrowLeft"} ariaHidden size={12} />,
                                      onSelect: () => {
                                          if (index <= 0) {
                                              return;
                                          }

                                          dispatch(repositionDashboardTab(index, index - 1));
                                      },
                                      closeOnSelect: false as const,
                                  },
                                  index < tabs.length - 1 && {
                                      id: "moveRight",
                                      label: intl.formatMessage({ id: "dashboard.tabs.move.right" }),
                                      iconLeft: <UiIcon type={"arrowRight"} ariaHidden size={12} />,
                                      onSelect: () => {
                                          if (index >= tabs.length - 1) {
                                              return;
                                          }

                                          dispatch(repositionDashboardTab(index, index + 1));
                                      },
                                      closeOnSelect: false as const,
                                  },

                                  ...(isOnlyOneTab
                                      ? []
                                      : [
                                            separatorStaticItem,

                                            {
                                                id: "delete",
                                                label: intl.formatMessage({ id: "delete" }),
                                                iconLeft: <UiIcon type={"trash"} ariaHidden size={12} />,
                                                onSelect: () =>
                                                    dispatch(deleteDashboardTab(tab.localIdentifier)),
                                            },
                                        ]),
                              ].filter((x) => !!x)
                            : [],
                    }) satisfies IUiTab,
            ) ?? [];

        // In edit mode, if tabs feature is enabled but no tabs exist, create a default "Untitled" tab
        if (isEditMode && enableDashboardTabs && mappedTabs.length === 0) {
            return [
                {
                    id: defaultTabIdRef.current,
                    label: intl.formatMessage({ id: "dashboard.tabs.default.label" }),
                    variant: "placeholder",
                },
            ];
        }

        return mappedTabs;
    }, [tabs, isEditMode, enableDashboardTabs, intl, dispatch]);

    // Use the default tab ID as activeTabLocalIdentifier if we created a default tab and no activeTabLocalIdentifier is set
    const effectiveActiveTabLocalIdentifier = useMemo(() => {
        if (isEditMode && enableDashboardTabs && tabs.length === 0 && !activeTabLocalIdentifier) {
            return defaultTabIdRef.current;
        }
        return activeTabLocalIdentifier;
    }, [isEditMode, enableDashboardTabs, tabs, activeTabLocalIdentifier]);

    return {
        enableDashboardTabs,
        activeTabLocalIdentifier: effectiveActiveTabLocalIdentifier,
        uiTabs,
        handleTabSelect,
    };
}

const tabsBem = bemFactory("gd-dash-tabs");

interface IDashboardTabsProps {
    enableDashboardTabs: boolean;
    activeTabLocalIdentifier?: string;
    uiTabs: IUiTab[];
    handleTabSelect: (tab: IUiTab) => void;
}
/**
 * @internal
 */
export function DashboardTabs({
    enableDashboardTabs,
    activeTabLocalIdentifier,
    uiTabs,
    handleTabSelect,
}: IDashboardTabsProps): ReactElement | null {
    const intl = useIntl();
    const isEditMode = useDashboardSelector(selectIsInEditMode);
    const dispatch = useDashboardDispatch();

    const ACCESSIBILITY_CONFIG = useMemo(
        () => ({
            role: "tablist",
            tabRole: "tab",
            ariaLabel: intl.formatMessage({ id: "dashboard.tabs.accessibility.label" }),
        }),
        [intl],
    );

    const shouldHideTabs = useMemo(() => {
        if (!enableDashboardTabs || !uiTabs || activeTabLocalIdentifier === undefined) {
            return true;
        }
        return isEditMode ? uiTabs.length < 1 : uiTabs.length <= 1;
    }, [isEditMode, enableDashboardTabs, uiTabs, activeTabLocalIdentifier]);

    if (shouldHideTabs) {
        return null;
    }

    const isCreateEnabled = isEditMode && !uiTabs.some((tab) => tab.variant === "placeholder");

    return (
        <div className={tabsBem.b({ "with-create": isCreateEnabled })}>
            <div className={tabsBem.e("list")}>
                <UiTabs
                    size="large"
                    tabs={uiTabs}
                    onTabSelect={handleTabSelect}
                    selectedTabId={activeTabLocalIdentifier ?? uiTabs[0].id}
                    accessibilityConfig={ACCESSIBILITY_CONFIG}
                    maxLabelLength={255}
                />
            </div>
            {isCreateEnabled ? (
                <div className={tabsBem.e("add-wrapper")}>
                    <div className={tabsBem.e("add")}>
                        <UiIconButton
                            icon={"plus"}
                            size={"large"}
                            variant={"tertiary"}
                            onClick={() => dispatch(createDashboardTab())}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
}
