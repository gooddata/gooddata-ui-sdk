// (C) 2020-2025 GoodData Corporation
import { useEffect } from "react";

import { IKpiWidget, IWidgetAlert } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import {
    IBrokenAlertFilterBasicInfo,
    QueryProcessingStatus,
    queryWidgetBrokenAlerts,
    selectFilterContextFilters,
    useDashboardQueryProcessing,
    useDashboardSelector,
} from "../../../model/index.js";

export const useWidgetBrokenAlertsQuery = (
    widget: IKpiWidget,
    alert: IWidgetAlert | undefined,
): {
    result?: IBrokenAlertFilterBasicInfo[];
    status?: QueryProcessingStatus;
    error?: GoodDataSdkError;
} => {
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
        if (widget.ref) {
            runBrokenAlertsQuery(widget.ref);
        }

        // queryWidgetBrokenAlerts as a parameter it needs just widget.ref but internally result depends on alert, widget, dashboardFilters
        // we have to call query every time when this dependency changed to get fresh results
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [alert, widget, dashboardFilters]);

    return {
        result: effectiveFilters,
        status,
        error,
    };
};
