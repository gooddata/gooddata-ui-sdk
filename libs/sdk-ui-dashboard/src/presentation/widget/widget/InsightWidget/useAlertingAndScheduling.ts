// (C) 2024-2026 GoodData Corporation

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";
import {
    isInsightAlertingConfigurationEnabled,
    isInsightScheduledExportsConfigurationEnabled,
    isInsightSupportedForAlerts,
    isInsightSupportedForScheduledExports,
} from "@gooddata/sdk-ui-ext";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectIsReadOnly, selectSettings } from "../../../../model/store/config/configSelectors.js";
import { selectNotificationChannelsCount } from "../../../../model/store/notificationChannels/notificationChannelsSelectors.js";
import { selectCanManageWorkspace } from "../../../../model/store/permissions/permissionsSelectors.js";
import { isCustomWidget } from "../../../../model/types/layoutTypes.js";
import {
    type AlertingDisabledReason,
    type SchedulingDisabledReason,
} from "../../insightMenu/DefaultDashboardInsightMenu/types.js";

type UseAlertingAndSchedulingConfig = {
    insight?: IInsight;
    widget: IInsightWidget;
};

export const useAlertingAndScheduling = ({
    widget,
    insight,
}: UseAlertingAndSchedulingConfig): {
    isAlertingVisible: boolean;
    alertingDisabled: boolean;
    alertingDisabledReason?: AlertingDisabledReason;
    scheduleExportDisabled: boolean;
    scheduleExportManagementDisabled: boolean;
    scheduleExportDisabledReason?: SchedulingDisabledReason;
} => {
    const settings = useDashboardSelector(selectSettings);
    const isReadOnly = useDashboardSelector(selectIsReadOnly);
    const isWorkspaceManager = useDashboardSelector(selectCanManageWorkspace);

    const numberOfAvailableDestinations = useDashboardSelector(selectNotificationChannelsCount);
    /**
     * We want to hide automations when there are no destinations unless the user is admin.
     */
    const showDueToNumberOfAvailableDestinations = numberOfAvailableDestinations > 0 || isWorkspaceManager;
    const isStandardWidget = !isCustomWidget(widget);
    const hasNoDestinations = numberOfAvailableDestinations === 0;

    //NOTE: Check if widget has localIdentifier, if not that is probably widget from old dashboard
    // and we should not allow to schedule export/alert because we need localIdentifier to identify the widget
    const widgetHasNoLocalIdentifier = !widget.localIdentifier;

    const isAlertingEnabled = settings.enableAlerting === true;
    const isInsightTypeSupportedForAlerting = isInsightSupportedForAlerts(insight);
    const isInsightEnabledForAlerting = isInsightAlertingConfigurationEnabled(insight);
    const isAlertingVisible =
        isAlertingEnabled &&
        isStandardWidget &&
        isInsightTypeSupportedForAlerting &&
        !isReadOnly &&
        showDueToNumberOfAvailableDestinations;
    const alertingDisabled = hasNoDestinations || !isInsightEnabledForAlerting || widgetHasNoLocalIdentifier;
    let alertingDisabledReason: AlertingDisabledReason | undefined = undefined;
    if (widgetHasNoLocalIdentifier) {
        alertingDisabledReason = "oldWidget";
    } else if (hasNoDestinations) {
        alertingDisabledReason = "noDestinations";
    } else if (!isInsightEnabledForAlerting) {
        alertingDisabledReason = "disabledOnInsight";
    }

    const isInsightTypeSupportedForScheduling = isInsightSupportedForScheduledExports(insight);
    const isInsightEnabledForScheduling = isInsightScheduledExportsConfigurationEnabled(insight);
    const scheduleExportDisabled =
        !isInsightTypeSupportedForScheduling ||
        !isStandardWidget ||
        !isInsightEnabledForScheduling ||
        widgetHasNoLocalIdentifier;
    const scheduleExportManagementDisabled = !isStandardWidget;
    let scheduleExportDisabledReason: SchedulingDisabledReason | undefined = undefined;
    if (widgetHasNoLocalIdentifier) {
        scheduleExportDisabledReason = "oldWidget";
    } else if (!isStandardWidget) {
        scheduleExportDisabledReason = "incompatibleWidget";
    } else if (!isInsightEnabledForScheduling || !isInsightTypeSupportedForScheduling) {
        scheduleExportDisabledReason = "disabledOnInsight";
    }

    return {
        isAlertingVisible,
        alertingDisabled,
        alertingDisabledReason,
        scheduleExportDisabled,
        scheduleExportManagementDisabled,
        scheduleExportDisabledReason,
    };
};
