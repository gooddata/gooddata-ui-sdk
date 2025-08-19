// (C) 2022-2025 GoodData Corporation
import { useCallback } from "react";

import { IAutomationMetadataObject, IWidget, areObjRefsEqual, isInsightWidget } from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { useDashboardAlertsCommands } from "./useDashboardAlertsCommands.js";
import { messages } from "../../../locales.js";
import {
    selectDashboardRef,
    selectInsights,
    selectNotificationChannels,
    selectWidgets,
} from "../../store/index.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { useDashboardAutomations } from "../useDashboardAutomations/useDashboardAutomations.js";
import { useDashboardUserInteraction } from "../useDashboardUserInteraction.js";

/**
 * @internal
 */
export const useDashboardAlertsDialog = () => {
    const { addSuccess, addError } = useToastMessage();
    const { automationInteraction } = useDashboardUserInteraction();

    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const destinations = useDashboardSelector(selectNotificationChannels);
    const allWidgets = useDashboardSelector(selectWidgets);
    const allInsights = useDashboardSelector(selectInsights);

    const { closeAlertDialog, openAlertDialog } = useDashboardAlertsCommands();

    const { refreshAutomations } = useDashboardAutomations();

    /*
     * exports and scheduling are not available when rendering a dashboard that is not persisted.
     * this can happen when a new dashboard is created and is being edited.
     *
     * the setup of menu items available in the menu needs to reflect this.
     */
    const defaultOnAlerting = useCallback(
        (widget?: IWidget) => {
            if (!dashboardRef) {
                return;
            }

            openAlertDialog(widget);
        },
        [dashboardRef, openAlertDialog],
    );

    // Open / Close
    const onAlertingOpen = useCallback(
        (widget?: IWidget, alert?: IAutomationMetadataObject) => {
            openAlertDialog(widget, alert);
        },
        [openAlertDialog],
    );

    const onAlertingCancel = useCallback(() => {
        closeAlertDialog();
    }, [closeAlertDialog]);

    // Create
    const onAlertingCreateSuccess = useCallback(
        (alert: IAutomationMetadataObject) => {
            closeAlertDialog();
            addSuccess(messages.alertAddSuccess);
            refreshAutomations();
            const widgetId = alert.metadata?.widget;

            const widget = allWidgets.find((widget) => widget.localIdentifier === widgetId);
            const insight = allInsights.find((insight) => {
                return isInsightWidget(widget) && areObjRefsEqual(insight.insight.ref, widget.insight);
            });

            const destinationType = destinations.find(
                (channel) => channel.id === alert.notificationChannel,
            )?.destinationType;
            automationInteraction({
                type: "alertCreated",
                destination_id: alert.notificationChannel,
                destination_type: destinationType,
                automation_id: alert.id,
                automation_name: alert.title,
                automation_visualization_type: insight?.insight.visualizationUrl,
                trigger_type: alert.alert?.trigger?.mode,
            });
        },
        [
            closeAlertDialog,
            addSuccess,
            refreshAutomations,
            allWidgets,
            allInsights,
            destinations,
            automationInteraction,
        ],
    );

    const onAlertingCreateError = useCallback(() => {
        closeAlertDialog();
        addError(messages.alertAddError);
    }, [closeAlertDialog, addError]);

    // Edit
    const onAlertingSaveSuccess = useCallback(() => {
        closeAlertDialog();
        addSuccess(messages.alertUpdateSuccess);
        refreshAutomations();
    }, [closeAlertDialog, addSuccess, refreshAutomations]);

    const onAlertingSaveError = useCallback(() => {
        closeAlertDialog();
        addError(messages.alertUpdateError);
    }, [closeAlertDialog, addError]);

    const onAlertingPauseError = useCallback(() => {
        addError(messages.alertingManagementPauseError);
    }, [addError]);

    const onAlertingPauseSuccess = useCallback(() => {
        addSuccess(messages.alertingManagementPauseSuccess);
    }, [addSuccess]);

    const onAlertingResumeSuccess = useCallback(() => {
        addSuccess(messages.alertingManagementActivateSuccess);
    }, [addSuccess]);

    const onAlertingResumeError = useCallback(() => {
        addError(messages.alertingManagementActivateError);
    }, [addError]);

    return {
        defaultOnAlerting,
        onAlertingOpen,
        onAlertingCancel,
        onAlertingCreateError,
        onAlertingCreateSuccess,
        onAlertingSaveError,
        onAlertingSaveSuccess,
        onAlertingPauseError,
        onAlertingPauseSuccess,
        onAlertingResumeError,
        onAlertingResumeSuccess,
    };
};
