// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";
import { areObjRefsEqual, isInsightWidget, IWidget } from "@gooddata/sdk-model";
import { selectEnableScheduling, selectInsights, selectWidgets, uiActions } from "../../store/index.js";
import { useDashboardDispatch, useDashboardSelector } from "../DashboardStoreProvider.js";
import { useDashboardUserInteraction } from "../useDashboardUserInteraction.js";

/**
 * @internal
 */
export const useDashboardScheduledEmailsCommands = () => {
    const dispatch = useDashboardDispatch();
    const { automationInteraction } = useDashboardUserInteraction();
    const widgets = useDashboardSelector(selectWidgets);
    const insights = useDashboardSelector(selectInsights);

    // Feature Flags
    const isScheduledEmailingEnabled = useDashboardSelector(selectEnableScheduling);

    // Single Schedule Dialog
    const openScheduleEmailingDialog = useCallback(
        (widget?: IWidget, openedFrom?: string) => {
            if (isScheduledEmailingEnabled) {
                dispatch(
                    uiActions.openScheduleEmailDialog({
                        ...(widget?.ref ? { widgetRef: widget.ref, openedFrom } : { openedFrom }),
                    }),
                );

                const selectedWidget = widgets.find((w) => w.localIdentifier === widget?.localIdentifier);
                const insightRef = isInsightWidget(selectedWidget) ? selectedWidget.insight : undefined;
                const insight = insights.find((i) => areObjRefsEqual(i.insight.ref, insightRef));
                automationInteraction({
                    type: "scheduledExportInitialized",
                    automation_source: widget ? "widget" : "dashboard",
                    automation_visualization_type: insight?.insight.visualizationUrl,
                });
            }
        },
        [automationInteraction, dispatch, insights, isScheduledEmailingEnabled, widgets],
    );

    const closeScheduleEmailingDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.closeScheduleEmailDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );

    // List / Management Dialog
    const openScheduleEmailingManagementDialog = useCallback(
        (widget?: IWidget, openedFrom?: string) =>
            isScheduledEmailingEnabled &&
            dispatch(
                uiActions.openScheduleEmailManagementDialog({
                    ...(widget?.ref ? { widgetRef: widget.ref, openedFrom } : { openedFrom }),
                }),
            ),
        [dispatch, isScheduledEmailingEnabled],
    );

    const closeScheduleEmailingManagementDialog = useCallback(
        () => isScheduledEmailingEnabled && dispatch(uiActions.closeScheduleEmailManagementDialog()),
        [dispatch, isScheduledEmailingEnabled],
    );

    return {
        openScheduleEmailingDialog,
        closeScheduleEmailingDialog,
        openScheduleEmailingManagementDialog,
        closeScheduleEmailingManagementDialog,
    };
};
