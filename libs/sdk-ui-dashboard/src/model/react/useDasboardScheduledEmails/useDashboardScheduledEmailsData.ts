// (C) 2022-2025 GoodData Corporation
import {
    IAutomationMetadataObject,
    IExportDefinitionVisualizationObjectContent,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import {
    selectAllAutomationsCount,
    selectAutomationsError,
    selectAutomationsIsInitialized,
    selectAutomationsIsLoading,
    selectCanCreateAutomation,
    selectCanManageWorkspace,
    selectDashboardUserAutomationSchedulesInContext,
    selectEnableExportToDocumentStorage,
    selectEnableScheduling,
    selectEntitlementMaxAutomations,
    selectEntitlementUnlimitedAutomations,
    selectFilterableWidgetByRef,
    selectInsightByWidgetRef,
    selectIsInViewMode,
    selectIsReadOnly,
    selectIsScheduleEmailDialogContext,
    selectIsScheduleEmailDialogOpen,
    selectIsScheduleEmailManagementDialogOpen,
    selectMenuButtonItemsVisibility,
    selectNotificationChannels,
    selectNotificationChannelsCount,
    selectNotificationChannelsCountWithoutInPlatform,
    selectNotificationChannelsWithoutInPlatform,
} from "../../store/index.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { DEFAULT_MAX_AUTOMATIONS } from "../useDashboardAutomations/constants.js";

interface IUseDashboardScheduledEmailsDataProps {
    scheduledExportToEdit?: IAutomationMetadataObject;
}

/**
 * @internal
 */
export const useDashboardScheduledEmailsData = ({
    scheduledExportToEdit,
}: IUseDashboardScheduledEmailsDataProps) => {
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

    const enableExportToDocumentStorage = useDashboardSelector(selectEnableExportToDocumentStorage);

    const notificationChannelsWithoutInPlatform = useDashboardSelector(
        selectNotificationChannelsWithoutInPlatform,
    );
    const numberOfAvailableDestinationsWithoutInPlatform = useDashboardSelector(
        selectNotificationChannelsCountWithoutInPlatform,
    );

    const notificationChannelsAll = useDashboardSelector(selectNotificationChannels);
    const numberOfAvailableDestinationsAll = useDashboardSelector(selectNotificationChannelsCount);

    const notificationChannels = enableExportToDocumentStorage
        ? notificationChannelsAll
        : notificationChannelsWithoutInPlatform;
    const numberOfAvailableDestinations = enableExportToDocumentStorage
        ? numberOfAvailableDestinationsAll
        : numberOfAvailableDestinationsWithoutInPlatform;

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
    const isScheduledManagementEmailingVisible =
        isSchedulingAvailable && (canCreateAutomation || automations.length > 0);
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
