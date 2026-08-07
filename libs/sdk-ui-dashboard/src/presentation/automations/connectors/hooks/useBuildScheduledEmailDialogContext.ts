// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    createScheduledEmail as createScheduledEmailCmd,
    saveScheduledEmail as saveScheduledEmailCmd,
} from "../../../../model/commands/scheduledEmail.js";
import type { IDashboardScheduledEmailCreated } from "../../../../model/events/scheduledEmail.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useExportTemplates } from "../../../../model/react/useExportTemplates.js";
import { selectDateFormat } from "../../../../model/store/config/configSelectors.js";
import { selectIsCrossFiltering } from "../../../../model/store/drill/drillSelectors.js";
import {
    selectAutomationCommonDateFilterId,
    selectDashboardHiddenFilters,
} from "../../../../model/store/filtering/dashboardFilterSelectors.js";
import { selectDashboardId, selectDashboardTitle } from "../../../../model/store/meta/metaSelectors.js";
import { selectEffectiveAttributeFiltersModeMap } from "../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectEffectiveDateFilterMode } from "../../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectEffectiveDateFiltersModeMap } from "../../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import { selectExportEffectiveParameters } from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { getWidgetTitle } from "../../../../model/utils/dashboardItemUtils.js";
import type { IScheduledEmailDialogContextValue } from "../../contexts/ScheduledEmailDialogContext.js";

import { useCommandAsPromise, useDeleteAutomation } from "./useCommandAsPromise.js";

export interface IUseBuildScheduledEmailDialogContextOpts {
    widget?: IWidget;
    insight?: IInsight;
    scheduledExportToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    isLoading: boolean;
    dashboardFilters?: FilterContextItem[];
}

export function useBuildScheduledEmailDialogContext(
    opts: IUseBuildScheduledEmailDialogContextOpts,
): IScheduledEmailDialogContextValue {
    const { widget, insight, scheduledExportToEdit, notificationChannels, isLoading, dashboardFilters } =
        opts;

    const hiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);
    const exportParametersByTab = useDashboardSelector(
        selectExportEffectiveParameters(widget ? [objRefToString(widget.ref)] : undefined),
    );
    const exportTemplates = useExportTemplates();

    const dateFormat = useDashboardSelector(selectDateFormat);
    const isCrossFiltering = useDashboardSelector(selectIsCrossFiltering);
    const commonDateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const dateFiltersModeMap = useDashboardSelector(selectEffectiveDateFiltersModeMap);
    const attributeFiltersModeMap = useDashboardSelector(selectEffectiveAttributeFiltersModeMap);

    const widgetTitle = useMemo(() => {
        if (widget) {
            return getWidgetTitle(widget);
        }
        return undefined;
    }, [widget]);

    const createScheduledEmail = useCommandAsPromise({
        commandCreator: createScheduledEmailCmd,
        successEvent: "GDC.DASH/EVT.SCHEDULED_EMAIL.CREATED",
        resolveWith: (event: IDashboardScheduledEmailCreated) => event.payload.scheduledEmail,
    });

    const saveScheduledEmail = useCommandAsPromise({
        commandCreator: saveScheduledEmailCmd,
        successEvent: "GDC.DASH/EVT.SCHEDULED_EMAIL.SAVED",
        resolveWith: (_event, input: IAutomationMetadataObject) => input,
    });

    const deleteScheduledEmail = useDeleteAutomation();

    return useMemo(
        () => ({
            widget,
            insight,
            widgetTitle,
            dashboardId,
            dashboardTitle,
            dashboardFilters,
            hiddenFilters,
            commonDateFilterId,
            exportParametersByTab,
            exportTemplates,
            dateFormat,
            isCrossFiltering,
            commonDateFilterMode,
            dateFiltersModeMap,
            attributeFiltersModeMap,
            createScheduledEmail,
            saveScheduledEmail,
            deleteScheduledEmail,
            scheduledExportToEdit,
            notificationChannels,
            isLoading,
        }),
        [
            widget,
            insight,
            widgetTitle,
            dashboardId,
            dashboardTitle,
            dashboardFilters,
            hiddenFilters,
            commonDateFilterId,
            exportParametersByTab,
            exportTemplates,
            dateFormat,
            isCrossFiltering,
            commonDateFilterMode,
            dateFiltersModeMap,
            attributeFiltersModeMap,
            createScheduledEmail,
            saveScheduledEmail,
            deleteScheduledEmail,
            scheduledExportToEdit,
            notificationChannels,
            isLoading,
        ],
    );
}
