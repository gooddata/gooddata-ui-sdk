// (C) 2020-2026 GoodData Corporation

import { useEffect } from "react";

import { type IKpiWidget, type IWidgetAlert } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { queryWidgetBrokenAlerts } from "../../../model/queries/widgets.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import {
    type QueryProcessingStatus,
    useDashboardQueryProcessing,
} from "../../../model/react/useDashboardQueryProcessing.js";
import { selectFilterContextFilters } from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { type IBrokenAlertFilterBasicInfo } from "../../../model/types/alertTypes.js";

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
