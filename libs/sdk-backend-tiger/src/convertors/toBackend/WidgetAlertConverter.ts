// (C) 2023 GoodData Corporation
import { IdentifierRef, IWidgetAlertDefinition } from "@gooddata/sdk-model";
import { JsonApiWidgetAlertInDocument } from "@gooddata/api-client-tiger";
import { v4 as uuid } from "uuid";

export function convertWidgetAlert(alert: IWidgetAlertDefinition): JsonApiWidgetAlertInDocument {
    return {
        data: {
            attributes: {
                actionName: alert.actionName,
                description: alert.description,
                title: alert.title,
                threshold: alert.threshold,
                whenTriggered: alert.whenTriggered,
            },
            type: "widgetAlert",
            relationships: {
                filterContext: alert.filterContext
                    ? {
                          data: {
                              type: "filterContext",
                              id: alert.filterContext.identifier!,
                          },
                      }
                    : undefined,
                visualizationObject: {
                    data: {
                        type: "visualizationObject",
                        id: (alert.widget as IdentifierRef).identifier,
                    },
                },
            },
            id: alert.identifier || uuid().replace(/-/g, ""),
        },
    };
}
