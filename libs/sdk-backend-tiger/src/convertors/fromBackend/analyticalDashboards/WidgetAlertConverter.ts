// (C) 2023 GoodData Corporation
import { idRef, IWidgetAlert } from "@gooddata/sdk-model";
import { JsonApiFilterContextOutWithLinks, JsonApiWidgetAlertOutWithLinks } from "@gooddata/api-client-tiger";
import { convertFilterContextFromBackend } from "./v2/AnalyticalDashboardConverter.js";

export function convertWidgetAlert(
    widgetAlert: JsonApiWidgetAlertOutWithLinks,
    filterContext?: JsonApiFilterContextOutWithLinks,
): IWidgetAlert {
    const { id, attributes, relationships } = widgetAlert;
    return {
        ref: idRef(id, "widgetAlert"),
        identifier: id,
        uri: "useless",
        title: attributes!.title ?? "Alert",
        description: attributes!.description ?? "",
        isTriggered: false,
        threshold: attributes!.threshold!,
        whenTriggered: attributes!.whenTriggered! as any,
        actionName: attributes!.actionName,
        filterContext:
            filterContext &&
            convertFilterContextFromBackend({
                data: filterContext,
                links: { self: "useless" },
            }),
        widget: idRef(relationships!.visualizationObject!.data!.id, "insight"),
        dashboard: idRef(relationships!.analyticalDashboard!.data!.id, "analyticalDashboard"),
    };
}
