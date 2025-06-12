// (C) 2022-2025 GoodData Corporation
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import {
    selectCanManageWorkspace,
    selectIsInViewMode,
    selectIsReadOnly,
    selectMenuButtonItemsVisibility,
    selectEntitlementMaxAutomations,
    selectAllAutomationsCount,
    selectAutomationsIsLoading,
    selectAutomationsError,
    selectDashboardUserAutomationAlertsInContext,
    selectEntitlementUnlimitedAutomations,
    selectCanCreateAutomation,
    selectIsAlertsManagementDialogOpen,
    selectInsightByWidgetRef,
    selectAutomationsIsInitialized,
    selectFilterableWidgetByRef,
    selectEnableAlerting,
    selectIsAlertingDialogOpen,
    selectNotificationChannels,
    selectNotificationChannelsCount,
} from "../../store/index.js";
import { useDashboardSelector } from "../DashboardStoreProvider.js";
import { selectAlertingDialogContext } from "../../store/ui/uiSelectors.js";
import { DEFAULT_MAX_AUTOMATIONS } from "../useDashboardAutomations/constants.js";

interface IUseDashboardAlertsDataProps {
    alertToEdit?: IAutomationMetadataObject;
}

/**
 * @internal
 */
export const useDashboardAlertsData = ({ alertToEdit }: IUseDashboardAlertsDataProps) => {
    const isInitialized = useDashboardSelector(selectAutomationsIsInitialized);
    const automations = useDashboardSelector(selectDashboardUserAutomationAlertsInContext(undefined));
    const automationsCount = useDashboardSelector(selectAllAutomationsCount);
    const automationsLoading = useDashboardSelector(selectAutomationsIsLoading);
    const automationsError = useDashboardSelector(selectAutomationsError);

    // Dashboard mode
    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const isInViewMode = useDashboardSelector(selectIsInViewMode);

    // Visibility configuration
    const menuButtonItemsVisibility = useDashboardSelector(selectMenuButtonItemsVisibility);

    // Feature flags
    const isAlertingEnabled = useDashboardSelector(selectEnableAlerting);

    // Permissions
    const isWorkspaceManager = useDashboardSelector(selectCanManageWorkspace);
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);

    // Entitlements
    const maxAutomationsEntitlement = useDashboardSelector(selectEntitlementMaxAutomations);
    const unlimitedAutomationsEntitlement = useDashboardSelector(selectEntitlementUnlimitedAutomations);
    const maxAutomations = parseInt(maxAutomationsEntitlement?.value ?? DEFAULT_MAX_AUTOMATIONS, 10);

    const notificationChannels = useDashboardSelector(selectNotificationChannels);
    const numberOfAvailableDestinations = useDashboardSelector(selectNotificationChannelsCount);
    const maxAutomationsReached = automationsCount >= maxAutomations && !unlimitedAutomationsEntitlement;

    /**
     * We want to hide scheduling when there are no webhooks unless the user is admin.
     */
    const showDueToNumberOfAvailableDestinations = numberOfAvailableDestinations > 0 || isWorkspaceManager;

    const isAlertingAvailable =
        isInViewMode &&
        !isReadOnly &&
        isAlertingEnabled &&
        showDueToNumberOfAvailableDestinations &&
        (menuButtonItemsVisibility.alertingButton ?? true);

    // Single Schedule Dialog
    const isAlertingVisible = isAlertingAvailable && canCreateAutomation && !maxAutomationsReached;

    const isAlertDialogOpen = useDashboardSelector(selectIsAlertingDialogOpen) || false;
    const alertDialogContext = useDashboardSelector(selectAlertingDialogContext);

    // List / Management Dialog
    const isAlertManagementVisible = isAlertingAvailable && (canCreateAutomation || automations.length > 0);
    const isAlertManagementDialogOpen = useDashboardSelector(selectIsAlertsManagementDialogOpen) || false;

    // Widget and Insight
    const editWidgetId = alertToEdit?.metadata?.widget;
    const editWidgetRef = editWidgetId ? { identifier: editWidgetId } : undefined;

    const widget = useDashboardSelector(
        selectFilterableWidgetByRef(alertDialogContext?.widgetRef ?? editWidgetRef),
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
        // Single Alert Dialog
        isAlertingVisible,
        isAlertDialogOpen,
        // List / Management Dialog
        isAlertManagementVisible,
        isAlertManagementDialogOpen,
    };
};
