// (C) 2024 GoodData Corporation

import { IInsight, IInsightWidget } from "@gooddata/sdk-model";
import {
    useDashboardSelector,
    selectSettings,
    isCustomWidget,
    selectIsReadOnly,
    selectCanManageWorkspace,
    selectNotificationChannelsCount,
} from "../../../../model/index.js";
import { AlertingDisabledReason, SchedulingDisabledReason } from "../../insightMenu/index.js";
import {
    isInsightAlertingConfigurationEnabled,
    isInsightScheduledExportsConfigurationEnabled,
    isInsightSupportedForAlerts,
    isInsightSupportedForScheduledExports,
} from "@gooddata/sdk-ui-ext";

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
