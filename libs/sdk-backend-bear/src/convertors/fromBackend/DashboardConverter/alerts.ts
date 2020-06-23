// (C) 2019-2020 GoodData Corporation
import { GdcMetadata, GdcFilterContext } from "@gooddata/api-model-bear";
import { IWidgetAlert, IWidgetAlertDefinition } from "@gooddata/sdk-backend-spi";
import { uriRef } from "@gooddata/sdk-model";
import { convertFilterContext } from "./filterContext";

export const convertAlert = (
    alert: GdcMetadata.IWrappedKpiAlert,
    filterContext?: GdcFilterContext.IWrappedFilterContext,
): IWidgetAlert | IWidgetAlertDefinition => {
    const {
        kpiAlert: {
            content: { dashboard, isTriggered, kpi, threshold, whenTriggered },
            meta: { uri, identifier, title, summary: description },
        },
    } = alert;
    const convertedAlert: IWidgetAlert | IWidgetAlertDefinition = {
        title,
        description,
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

    return convertedAlert;
};
