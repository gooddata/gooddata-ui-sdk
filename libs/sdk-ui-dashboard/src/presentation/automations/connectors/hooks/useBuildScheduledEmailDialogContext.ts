// (C) 2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import {
    type IAutomationMetadataObject,
    type IInsight,
    type IWidget,
    type ObjRef,
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
    selectAutomationDefaultSelectedFilters,
    selectDashboardHiddenFilters,
} from "../../../../model/store/filtering/dashboardFilterSelectors.js";
import { selectDashboardId, selectDashboardTitle } from "../../../../model/store/meta/metaSelectors.js";
import { selectEffectiveAttributeFiltersModeMap } from "../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectEffectiveDateFilterMode } from "../../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectEffectiveDateFiltersModeMap } from "../../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js";
import {
    selectWidgetLocalIdToTabIdMap,
    selectWidgetsMap,
} from "../../../../model/store/tabs/layout/layoutSelectors.js";
import { selectExportEffectiveParameters } from "../../../../model/store/tabs/parameters/parametersSelectors.js";
import { selectTabs } from "../../../../model/store/tabs/tabsSelectors.js";
import { getWidgetTitle } from "../../../../model/utils/dashboardItemUtils.js";
import type { IScheduledEmailDialogContextValue } from "../../contexts/ScheduledEmailDialogContext.js";

import { useCommandAsPromise, useDeleteAutomation } from "./useCommandAsPromise.js";

export interface IUseBuildScheduledEmailDialogContextOpts {
    widget?: IWidget;
    insight?: IInsight;
}

export function useBuildScheduledEmailDialogContext(
    opts: IUseBuildScheduledEmailDialogContextOpts,
): IScheduledEmailDialogContextValue {
    const { widget, insight } = opts;

    const dashboardFilters = useDashboardSelector(selectAutomationDefaultSelectedFilters);
    const hiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const widgetLocalIdToTabIdMap = useDashboardSelector(selectWidgetLocalIdToTabIdMap);
    const commonDateFilterId = useDashboardSelector(selectAutomationCommonDateFilterId);
    const exportParametersByTab = useDashboardSelector(
        selectExportEffectiveParameters(widget ? [objRefToString(widget.ref)] : undefined),
    );
    const exportTemplates = useExportTemplates();

    const dateFormat = useDashboardSelector(selectDateFormat);
    const isCrossFiltering = useDashboardSelector(selectIsCrossFiltering);
    const tabs = useDashboardSelector(selectTabs);
    const hasMultipleTabs = (tabs?.length ?? 0) > 1;
    const widgetsMap = useDashboardSelector(selectWidgetsMap);
    const commonDateFilterMode = useDashboardSelector(selectEffectiveDateFilterMode);
    const dateFiltersModeMap = useDashboardSelector(selectEffectiveDateFiltersModeMap);
    const attributeFiltersModeMap = useDashboardSelector(selectEffectiveAttributeFiltersModeMap);

    const widgetTitle = useMemo(() => {
        if (widget) {
            return getWidgetTitle(widget);
        }
        return undefined;
    }, [widget]);

    const widgetExistsByRef = useCallback(
        (ref: ObjRef | undefined): boolean => {
            return !!ref && widgetsMap.get(ref) !== undefined;
        },
        [widgetsMap],
    );

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
            widgetLocalIdToTabIdMap,
            commonDateFilterId,
            exportParametersByTab,
            exportTemplates,
            dateFormat,
            isCrossFiltering,
            hasMultipleTabs,
            widgetExistsByRef,
            commonDateFilterMode,
            dateFiltersModeMap,
            attributeFiltersModeMap,
            createScheduledEmail,
            saveScheduledEmail,
            deleteScheduledEmail,
        }),
        [
            widget,
            insight,
            widgetTitle,
            dashboardId,
            dashboardTitle,
            dashboardFilters,
            hiddenFilters,
            widgetLocalIdToTabIdMap,
            commonDateFilterId,
            exportParametersByTab,
            exportTemplates,
            dateFormat,
            isCrossFiltering,
            hasMultipleTabs,
            widgetExistsByRef,
            commonDateFilterMode,
            dateFiltersModeMap,
            attributeFiltersModeMap,
            createScheduledEmail,
            saveScheduledEmail,
            deleteScheduledEmail,
        ],
    );
}
