// (C) 2022-2026 GoodData Corporation

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
    selectEnableDashboardTabs,
    selectEnableScheduling,
    selectInsights,
    selectWidgets,
    uiActions,
} from "../../store/index.js";
import { useDashboardDispatch, useDashboardSelector } from "../DashboardStoreProvider.js";
import { useDashboardUserInteraction } from "../useDashboardUserInteraction.js";

/**
 * @internal
 */
interface IOpenScheduleEmailingDialogOptions {
    widget?: IWidget;
    openedFrom?: string;
    schedule?: IAutomationMetadataObject;
}

/**
 * @internal
 */
export const useDashboardScheduledEmailsCommands = () => {
    const dispatch = useDashboardDispatch();
    const { automationInteraction } = useDashboardUserInteraction();
    const widgets = useDashboardSelector(selectWidgets);
    const insights = useDashboardSelector(selectInsights);
    const enableDashboardTabs = useDashboardSelector(selectEnableDashboardTabs);
    const activeTabId = useDashboardSelector(selectActiveTabLocalIdentifier);

    // Feature Flags
    const isScheduledEmailingEnabled = useDashboardSelector(selectEnableScheduling);

    // Single Schedule Dialog
    const openScheduleEmailingDialog = useCallback(
        (options: IOpenScheduleEmailingDialogOptions = {}) => {
            const { widget, openedFrom, schedule } = options;

            if (isScheduledEmailingEnabled) {
                const targetTabIdentifier = schedule?.metadata?.targetTabIdentifier;
                if (enableDashboardTabs && targetTabIdentifier && targetTabIdentifier !== activeTabId) {
                    dispatch(switchDashboardTab(targetTabIdentifier));
                }

                dispatch(
                    uiActions.openScheduleEmailDialog({
                        ...(widget?.ref ? { widgetRef: widget.ref, openedFrom } : { openedFrom }),
                        ...(schedule ? { schedule } : {}),
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
        [
            activeTabId,
            automationInteraction,
            dispatch,
            enableDashboardTabs,
            insights,
            isScheduledEmailingEnabled,
            widgets,
        ],
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
