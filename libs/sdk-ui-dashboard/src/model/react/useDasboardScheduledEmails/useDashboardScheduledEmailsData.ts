// (C) 2022-2024 GoodData Corporation
import {
    IAutomationMetadataObject,
    IExportDefinitionVisualizationObjectContent,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";
import {
    selectCanManageWorkspace,
    selectEnableScheduling,
    selectIsInViewMode,
    selectIsReadOnly,
    selectMenuButtonItemsVisibility,
    selectEntitlementMaxAutomations,
    selectAllAutomationsCount,
    selectUsers,
    selectAutomationsIsLoading,
    selectAutomationsError,
    selectDashboardUserAutomationSchedulesInContext,
    selectEntitlementUnlimitedAutomations,
    selectCanCreateAutomation,
    selectIsScheduleEmailDialogOpen,
    selectIsScheduleEmailDialogContext,
    selectIsScheduleEmailManagementDialogOpen,
    selectInsightByWidgetRef,
    selectAutomationsIsInitialized,
    selectFilterableWidgetByRef,
    selectNotificationChannelsForScheduledExports,
    selectNotificationChannelsCountForScheduledExports,
} from "../../store/index.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";

/**
 * @alpha
 * Default maximum number of automations.
 */
export const DEFAULT_MAX_AUTOMATIONS = "10";

interface IUseDashboardScheduledEmailsDataProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
}

/**
 * @internal
 */
export const useDashboardScheduledEmailsData = ({
    scheduledExportToEdit,
}: IUseDashboardScheduledEmailsDataProps) => {
    const users = useDashboardSelector(selectUsers);

    const isInitialized = useDashboardSelector(selectAutomationsIsInitialized);
    const automations = useDashboardSelector(selectDashboardUserAutomationSchedulesInContext(undefined));
    const automationsCount = useDashboardSelector(selectAllAutomationsCount);
    const automationsLoading = useDashboardSelector(selectAutomationsIsLoading);
    const automationsError = useDashboardSelector(selectAutomationsError);

    // Dashboard mode
    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const isInViewMode = useDashboardSelector(selectIsInViewMode);

    // Visibility configuration
    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);

    // Feature flags
    const isScheduledEmailingEnabled = useDashboardSelector(selectEnableScheduling);

    // Permissions
    const isWorkspaceManager = useDashboardSelector(selectCanManageWorkspace);
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);

    // Entitlements
    const maxAutomationsEntitlement = useDashboardSelector(selectEntitlementMaxAutomations);
    const unlimitedAutomationsEntitlement = useDashboardSelector(selectEntitlementUnlimitedAutomations);
    const maxAutomations = parseInt(maxAutomationsEntitlement?.value ?? DEFAULT_MAX_AUTOMATIONS, 10);

    const notificationChannels = useDashboardSelector(selectNotificationChannelsForScheduledExports);
    const numberOfAvailableDestinations = useDashboardSelector(
        selectNotificationChannelsCountForScheduledExports,
    );
    const maxAutomationsReached = automationsCount >= maxAutomations && !unlimitedAutomationsEntitlement;

    /**
     * We want to hide scheduling when there are no webhooks unless the user is admin.
     */
    const showDueToNumberOfAvailableDestinations = numberOfAvailableDestinations > 0 || isWorkspaceManager;

    const isSchedulingAvailable =
        isInViewMode &&
        !isReadOnly &&
        isScheduledEmailingEnabled &&
        showDueToNumberOfAvailableDestinations &&
        (menuButtonItemsVisibility.scheduleEmailButton ?? true);

    // Single Schedule Dialog
    const isScheduledEmailingVisible = isSchedulingAvailable && canCreateAutomation && !maxAutomationsReached;
    const isScheduleEmailingDialogOpen = useDashboardSelector(selectIsScheduleEmailDialogOpen) || false;
    const scheduleEmailingDialogContext = useDashboardSelector(selectIsScheduleEmailDialogContext);

    // List / Management Dialog
    const isScheduledManagementEmailingVisible = isSchedulingAvailable && automations.length > 0;
    const isScheduleEmailingManagementDialogOpen =
        useDashboardSelector(selectIsScheduleEmailManagementDialogOpen) || false;

    // Widget and Insight
    const editWidgetId = (
        scheduledExportToEdit?.exportDefinitions?.find((exportDefinition) =>
            isExportDefinitionVisualizationObjectRequestPayload(exportDefinition.requestPayload),
        )?.requestPayload.content as IExportDefinitionVisualizationObjectContent
    )?.widget;
    const editWidgetRef = editWidgetId ? { identifier: editWidgetId } : undefined;
    const widget = useDashboardSelector(
        selectFilterableWidgetByRef(scheduleEmailingDialogContext?.widgetRef ?? editWidgetRef),
    );
    const insight = useDashboardSelector(selectInsightByWidgetRef(widget?.ref));

    return {
        // Data
        isInitialized,
        users,
        notificationChannels,
        automations,
        automationsLoading,
        automationsError,
        automationsCount,
        numberOfAvailableDestinations,
        widget,
        insight,
        // Single Schedule Dialog
        isScheduledEmailingVisible,
        isScheduleEmailingDialogOpen,
        // List / Management Dialog
        isScheduledManagementEmailingVisible,
        isScheduleEmailingManagementDialogOpen,
    };
};
