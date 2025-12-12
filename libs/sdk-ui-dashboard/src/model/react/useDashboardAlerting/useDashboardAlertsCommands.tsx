// (C) 2022-2025 GoodData Corporation

import { useCallback } from "react";

import {
    type IAutomationMetadataObject,
    type IWidget,
    areObjRefsEqual,
    isInsightWidget,
} from "@gooddata/sdk-model";

import { switchDashboardTab } from "../../commands/index.js";
import {
    selectActiveTabLocalIdentifier,
    selectEnableAlerting,
    selectEnableDashboardTabs,
    selectInsights,
    selectWidgetLocalIdToTabIdMap,
    selectWidgets,
    uiActions,
} from "../../store/index.js";
import { useDashboardDispatch, useDashboardSelector } from "../DashboardStoreProvider.js";
import { useDashboardUserInteraction } from "../useDashboardUserInteraction.js";

/**
 * @internal
 */
export const useDashboardAlertsCommands = () => {
    const dispatch = useDashboardDispatch();
    const { automationInteraction } = useDashboardUserInteraction();
    const widgets = useDashboardSelector(selectWidgets);
    const insights = useDashboardSelector(selectInsights);
    const widgetTabMap = useDashboardSelector(selectWidgetLocalIdToTabIdMap);
    const enableDashboardTabs = useDashboardSelector(selectEnableDashboardTabs);
    const activeTabId = useDashboardSelector(selectActiveTabLocalIdentifier);

    // Feature Flags
    const isAlertingEnabled = useDashboardSelector(selectEnableAlerting);

    // Single Alert Dialog
    const openAlertDialog = useCallback(
        (widget?: IWidget, alert?: IAutomationMetadataObject) => {
            if (isAlertingEnabled) {
                const widgetLocalId = widget?.localIdentifier ?? alert?.metadata?.widget;
                if (enableDashboardTabs && widgetLocalId) {
                    const targetTabId = widgetTabMap[widgetLocalId];
                    if (targetTabId && targetTabId !== activeTabId) {
                        dispatch(switchDashboardTab(targetTabId));
                    }
                }

                dispatch(
                    uiActions.openAlertingDialog({
                        ...(widget?.ref ? { widgetRef: widget.ref } : {}),
                        ...(alert ? { alert } : {}),
                    }),
                );

                const selectedWidget = widgets.find((w) => w.localIdentifier === widget?.localIdentifier);
                const insightRef = isInsightWidget(selectedWidget) ? selectedWidget.insight : undefined;
                const insight = insights.find((i) => areObjRefsEqual(i.insight.ref, insightRef));
                automationInteraction({
                    type: "alertInitialized",
                    automation_visualization_type: insight?.insight.visualizationUrl,
                });
            }
        },
        [
            activeTabId,
            automationInteraction,
            dispatch,
            enableDashboardTabs,
            insights,
            isAlertingEnabled,
            widgetTabMap,
            widgets,
        ],
    );
    const closeAlertDialog = useCallback(
        () => isAlertingEnabled && dispatch(uiActions.closeAlertingDialog()),
        [dispatch, isAlertingEnabled],
    );

    // List / Management Dialog
    const openAlertsManagementDialog = useCallback(
        (widget?: IWidget, openedFrom?: string) => {
            if (!isAlertingEnabled) {
                return;
            }

            if (enableDashboardTabs && widget?.localIdentifier) {
                const targetTabId = widgetTabMap[widget.localIdentifier];
                if (targetTabId && targetTabId !== activeTabId) {
                    dispatch(switchDashboardTab(targetTabId));
                }
            }

            dispatch(
                uiActions.openAlertingManagementDialog({
                    ...(widget?.ref ? { widgetRef: widget.ref, openedFrom } : { openedFrom }),
                }),
            );
        },
        [activeTabId, dispatch, enableDashboardTabs, isAlertingEnabled, widgetTabMap],
    );
    const closeAlertsManagementDialog = useCallback(
        () => isAlertingEnabled && dispatch(uiActions.closeAlertingManagementDialog()),
        [dispatch, isAlertingEnabled],
    );

    return {
        openAlertDialog,
        closeAlertDialog,
        openAlertsManagementDialog,
        closeAlertsManagementDialog,
    };
};
