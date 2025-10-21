// (C) 2022-2025 GoodData Corporation

import { useCallback } from "react";

import { IAutomationMetadataObject, IWidget, areObjRefsEqual, isInsightWidget } from "@gooddata/sdk-model";

import { selectEnableAlerting, selectInsights, selectWidgets, uiActions } from "../../store/index.js";
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

    // Feature Flags
    const isAlertingEnabled = useDashboardSelector(selectEnableAlerting);

    // Single Alert Dialog
    const openAlertDialog = useCallback(
        (widget?: IWidget, alert?: IAutomationMetadataObject) => {
            if (isAlertingEnabled) {
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
        [automationInteraction, dispatch, insights, isAlertingEnabled, widgets],
    );
    const closeAlertDialog = useCallback(
        () => isAlertingEnabled && dispatch(uiActions.closeAlertingDialog()),
        [dispatch, isAlertingEnabled],
    );

    // List / Management Dialog
    const openAlertsManagementDialog = useCallback(
        (widget?: IWidget, openedFrom?: string) =>
            isAlertingEnabled &&
            dispatch(
                uiActions.openAlertingManagementDialog({
                    ...(widget?.ref ? { widgetRef: widget.ref, openedFrom } : { openedFrom }),
                }),
            ),
        [dispatch, isAlertingEnabled],
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
