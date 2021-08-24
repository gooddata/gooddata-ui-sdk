// (C) 2020-2021 GoodData Corporation
import { useEffect } from "react";
import { ObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import {
    queryWidgetBrokenAlerts,
    IBrokenAlertFilterBasicInfo,
    QueryProcessingStatus,
    useDashboardQueryProcessing,
    selectAlertByWidgetRef,
    useDashboardSelector,
    selectWidgetByRef,
    selectFilterContextFilters,
} from "../../../model";

export const useWidgetBrokenAlertsQuery = (
    widgetRef: ObjRef,
): {
    result?: IBrokenAlertFilterBasicInfo[];
    status?: QueryProcessingStatus;
    error?: GoodDataSdkError;
} => {
    const alertSelector = selectAlertByWidgetRef(widgetRef);
    const alert = useDashboardSelector(alertSelector);

    const widgetSelector = selectWidgetByRef(widgetRef);
    const widget = useDashboardSelector(widgetSelector);

    const dashboardFilters = useDashboardSelector(selectFilterContextFilters);

    const {
        run: runBrokenAlertsQuery,
        result,
        status,
        error,
    } = useDashboardQueryProcessing({
        queryCreator: queryWidgetBrokenAlerts,
    });

    const effectiveFilters = result as IBrokenAlertFilterBasicInfo[];

    useEffect(() => {
        if (widgetRef) {
            runBrokenAlertsQuery(widgetRef);
        }
        // queryWidgetBrokenAlerts as a parameter it needs just widgetRef but internally result depends on alert, widget, dashboardFilters
        // we have to call query every time when this dependency changed to get fresh results
    }, [widgetRef, alert, widget, dashboardFilters]);

    return {
        result: effectiveFilters,
        status,
        error,
    };
};
