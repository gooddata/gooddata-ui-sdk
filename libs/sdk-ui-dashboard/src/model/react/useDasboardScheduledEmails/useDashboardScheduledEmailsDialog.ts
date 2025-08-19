// (C) 2022-2025 GoodData Corporation
import { useCallback, useState } from "react";

import {
    IAutomationMetadataObject,
    IExportDefinitionVisualizationObjectRequestPayload,
    IWidget,
    areObjRefsEqual,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
    isInsightWidget,
} from "@gooddata/sdk-model";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { useDashboardScheduledEmailsCommands } from "./useDashboardScheduledEmailsCommands.js";
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
export const useDashboardScheduledEmailsDialog = () => {
    const { addSuccess, addError } = useToastMessage();
    const { automationInteraction } = useDashboardUserInteraction();

    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const destinations = useDashboardSelector(selectNotificationChannels);
    const allWidgets = useDashboardSelector(selectWidgets);
    const allInsights = useDashboardSelector(selectInsights);

    const { closeScheduleEmailingDialog, openScheduleEmailingDialog, openScheduleEmailingManagementDialog } =
        useDashboardScheduledEmailsCommands();

    const { refreshAutomations } = useDashboardAutomations();

    const [shouldReturnToManagementDialog, setShouldReturnToManagementDialog] = useState<boolean>(false);

    /*
     * exports and scheduling are not available when rendering a dashboard that is not persisted.
     * this can happen when a new dashboard is created and is being edited.
     *
     * the setup of menu items available in the menu needs to reflect this.
     */
    const defaultOnScheduleEmailing = useCallback(
        (widget?: IWidget) => {
            if (!dashboardRef) {
                return;
            }

            openScheduleEmailingDialog({ widget, openedFrom: "dashboard" });
            setShouldReturnToManagementDialog(false);
        },
        [dashboardRef, openScheduleEmailingDialog, setShouldReturnToManagementDialog],
    );

    // Open / Close
    const onScheduleEmailingOpen = useCallback(
        (widget?: IWidget) => {
            openScheduleEmailingDialog({ widget, openedFrom: "widget" });
            setShouldReturnToManagementDialog(false);
        },
        [openScheduleEmailingDialog, setShouldReturnToManagementDialog],
    );

    const onScheduleEmailingCancel = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingDialog();
            if (shouldReturnToManagementDialog) {
                openScheduleEmailingManagementDialog(widget);
            }
        },
        [shouldReturnToManagementDialog, closeScheduleEmailingDialog, openScheduleEmailingManagementDialog],
    );

    const onScheduleEmailingBack = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingDialog();
            openScheduleEmailingManagementDialog(widget);
        },
        [closeScheduleEmailingDialog, openScheduleEmailingManagementDialog],
    );

    // Create
    const onScheduleEmailingCreateSuccess = useCallback(
        (scheduledEmail: IAutomationMetadataObject) => {
            closeScheduleEmailingDialog();
            openScheduleEmailingManagementDialog();
            addSuccess(messages.scheduleEmailSubmitSuccess);
            refreshAutomations();

            const widgetId = (
                scheduledEmail.exportDefinitions?.find(({ requestPayload }) =>
                    isExportDefinitionVisualizationObjectRequestPayload(requestPayload),
                )?.requestPayload as IExportDefinitionVisualizationObjectRequestPayload
            )?.content.widget;
            const widget = allWidgets.find((widget) => widget.localIdentifier === widgetId);
            const insight = allInsights.find((insight) => {
                return isInsightWidget(widget) && areObjRefsEqual(insight.insight.ref, widget.insight);
            });
            const dashboardFilters =
                scheduledEmail.exportDefinitions?.find(({ requestPayload }) =>
                    isExportDefinitionDashboardRequestPayload(requestPayload),
                )?.requestPayload.content.filters ?? [];
            const destinationType = destinations.find(
                (channel) => channel.id === scheduledEmail.notificationChannel,
            )?.destinationType;
            automationInteraction({
                type: "scheduledExportCreated",
                destination_id: scheduledEmail.notificationChannel,
                destination_type: destinationType,
                automation_id: scheduledEmail.id,
                automation_name: scheduledEmail.title,
                automation_source: widgetId ? "widget" : "dashboard",
                ...(insight ? { automation_visualization_type: insight?.insight.visualizationUrl } : {}),
                ...(!insight ? { filter_context: dashboardFilters.length > 0 ? "edited" : "default" } : {}),
            });
        },
        [
            closeScheduleEmailingDialog,
            openScheduleEmailingManagementDialog,
            addSuccess,
            refreshAutomations,
            allWidgets,
            allInsights,
            destinations,
            automationInteraction,
        ],
    );

    const onScheduleEmailingCreateError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSubmitError);
    }, [closeScheduleEmailingDialog, addError]);

    // Edit
    const onScheduleEmailingSaveSuccess = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingDialog();
            openScheduleEmailingManagementDialog(widget);
            addSuccess(messages.scheduleEmailSaveSuccess);
            refreshAutomations();
        },
        [closeScheduleEmailingDialog, openScheduleEmailingManagementDialog, addSuccess, refreshAutomations],
    );

    const onScheduleEmailingSaveError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSaveError);
    }, [closeScheduleEmailingDialog, addError]);

    return {
        defaultOnScheduleEmailing,
        onScheduleEmailingOpen,
        onScheduleEmailingCancel,
        onScheduleEmailingBack,
        onScheduleEmailingCreateError,
        onScheduleEmailingCreateSuccess,
        onScheduleEmailingSaveError,
        onScheduleEmailingSaveSuccess,
        setShouldReturnToManagementDialog,
    };
};
