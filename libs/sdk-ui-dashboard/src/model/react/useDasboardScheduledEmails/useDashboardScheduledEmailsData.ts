// (C) 2022-2026 GoodData Corporation

import {
    type IAutomationMetadataObject,
    type IExportDefinitionVisualizationObjectContent,
    isExportDefinitionVisualizationObjectRequestPayload,
} from "@gooddata/sdk-model";

import {
    selectAllAutomationsCount,
    selectAutomationsError,
    selectAutomationsIsInitialized,
    selectAutomationsIsLoading,
    selectDashboardUserAutomationSchedulesInContext,
} from "../../store/automations/automationsSelectors.js";
import {
    selectEnableExportToDocumentStorage,
    selectEnableScheduling,
    selectIsReadOnly,
} from "../../store/config/configSelectors.js";
import {
    selectEntitlementMaxAutomations,
    selectEntitlementUnlimitedAutomations,
} from "../../store/entitlements/entitlementsSelectors.js";
import { selectInsightByWidgetRef } from "../../store/insights/insightsSelectors.js";
import {
    selectNotificationChannels,
    selectNotificationChannelsCount,
    selectNotificationChannelsCountWithoutInPlatform,
    selectNotificationChannelsWithoutInPlatform,
} from "../../store/notificationChannels/notificationChannelsSelectors.js";
import {
    selectCanCreateAutomation,
    selectCanManageWorkspace,
} from "../../store/permissions/permissionsSelectors.js";
import { selectIsInViewMode } from "../../store/renderMode/renderModeSelectors.js";
import { selectFilterableWidgetByRef } from "../../store/tabs/layout/layoutSelectors.js";
import {
    selectIsScheduleEmailDialogContext,
    selectIsScheduleEmailDialogOpen,
    selectIsScheduleEmailManagementDialogOpen,
    selectMenuButtonItemsVisibility,
} from "../../store/ui/uiSelectors.js";
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
