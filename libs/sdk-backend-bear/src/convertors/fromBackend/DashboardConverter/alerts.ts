// (C) 2019-2022 GoodData Corporation
import { IWrappedFilterContext, IWrappedKpiAlert } from "@gooddata/api-model-bear";

import { uriRef, IWidgetAlert, IWidgetAlertDefinition } from "@gooddata/sdk-model";
import { convertFilterContext } from "./filterContext.js";

export const convertAlert = (
    alert: IWrappedKpiAlert,
    filterContext?: IWrappedFilterContext,
): IWidgetAlert | IWidgetAlertDefinition => {
    const {
        kpiAlert: {
            content: { dashboard, isTriggered, kpi, threshold, whenTriggered },
            meta: { uri, identifier, title, summary },
        },
    } = alert;
    return {
        title,
        description: summary!,
        ...(uri
            ? {
                  ref: uriRef(uri),
                  identifier,
                  uri,
              }
            : {}),
        dashboard: uriRef(dashboard),
        widget: uriRef(kpi),
        threshold,
        whenTriggered,
        isTriggered,
        filterContext: filterContext && convertFilterContext(filterContext),
    };
};
