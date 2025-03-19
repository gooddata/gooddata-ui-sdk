// (C) 2022-2024 GoodData Corporation
import { useCallback } from "react";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import {
    areObjRefsEqual,
    IAutomationMetadataObject,
    IExportDefinitionVisualizationObjectRequestPayload,
    isExportDefinitionDashboardRequestPayload,
    isExportDefinitionVisualizationObjectRequestPayload,
    isInsightWidget,
    IWidget,
} from "@gooddata/sdk-model";
import { messages } from "../../../locales.js";
import { useDashboardScheduledEmailsCommands } from "./useDashboardScheduledEmailsCommands.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import {
    selectDashboardRef,
    selectInsights,
    selectNotificationChannels,
    selectWidgets,
} from "../../store/index.js";
import { useDashboardAutomations } from "./useDashboardAutomations.js";
import { useDashboardUserInteraction } from "../useDashboardUserInteraction.js";

/**
 * @internal
 */
export interface IUseDashboardScheduledEmailsDialogProps {
    setScheduledExportToEdit: (automation?: IAutomationMetadataObject) => void;
}

/**
 * @internal
 */
export const useDashboardScheduledEmailsDialog = ({
    setScheduledExportToEdit,
}: IUseDashboardScheduledEmailsDialogProps) => {
    const { addSuccess, addError } = useToastMessage();
    const { automationInteraction } = useDashboardUserInteraction();

    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const destinations = useDashboardSelector(selectNotificationChannels);
    const allWidgets = useDashboardSelector(selectWidgets);
    const allInsights = useDashboardSelector(selectInsights);

    const { closeScheduleEmailingDialog, openScheduleEmailingDialog, openScheduleEmailingManagementDialog } =
        useDashboardScheduledEmailsCommands();

    const { refreshAutomations } = useDashboardAutomations();

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

            openScheduleEmailingDialog(widget);
        },
        [dashboardRef, openScheduleEmailingDialog],
    );

    // Open / Close
    const onScheduleEmailingOpen = useCallback(
        (widget?: IWidget) => {
            openScheduleEmailingDialog(widget);
        },
        [openScheduleEmailingDialog],
    );

    const onScheduleEmailingCancel = useCallback(
        (widget?: IWidget) => {
            closeScheduleEmailingDialog();
            setScheduledExportToEdit(undefined);
            openScheduleEmailingManagementDialog(widget);
        },
        [closeScheduleEmailingDialog, openScheduleEmailingManagementDialog, setScheduledExportToEdit],
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
            setScheduledExportToEdit(undefined);
            refreshAutomations();
        },
        [
            closeScheduleEmailingDialog,
            openScheduleEmailingManagementDialog,
            addSuccess,
            setScheduledExportToEdit,
            refreshAutomations,
        ],
    );

    const onScheduleEmailingSaveError = useCallback(() => {
        closeScheduleEmailingDialog();
        addError(messages.scheduleEmailSaveError);
        setScheduledExportToEdit(undefined);
    }, [closeScheduleEmailingDialog, addError, setScheduledExportToEdit]);

    return {
        defaultOnScheduleEmailing,
        onScheduleEmailingOpen,
        onScheduleEmailingCancel,
        onScheduleEmailingCreateError,
        onScheduleEmailingCreateSuccess,
        onScheduleEmailingSaveError,
        onScheduleEmailingSaveSuccess,
    };
};
