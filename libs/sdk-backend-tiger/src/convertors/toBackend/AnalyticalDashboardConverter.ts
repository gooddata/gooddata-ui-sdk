// (C) 2020-2021 GoodData Corporation
import { AnalyticalDashboardObjectModel } from "@gooddata/api-client-tiger";
import {
    DashboardWidget,
    IDashboardDefinition,
    IDashboardLayout,
    IFilterContextDefinition,
    LayoutPath,
    walkLayout,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import omit from "lodash/omit";
import updateWith from "lodash/updateWith";
import { cloneWithSanitizedIds } from "./IdSanitization";

function removeIdentifiers(widget: DashboardWidget) {
    return omit(widget, ["ref", "uri", "identifier"]);
}

function removeWidgetIdentifiersInLayout(layout: IDashboardLayout<DashboardWidget> | undefined) {
    if (!layout) {
        return;
    }

    const widgetsPaths: LayoutPath[] = [];
    walkLayout(layout, {
        widgetCallback: (_, widgetPath) => widgetsPaths.push(widgetPath),
    });

    return widgetsPaths.reduce((layout, widgetPath) => {
        return updateWith(layout, widgetPath, removeIdentifiers);
    }, layout);
}

export function convertAnalyticalDashboard(
    dashboard: IDashboardDefinition,
    filterContextRef?: ObjRef,
): AnalyticalDashboardObjectModel.IAnalyticalDashboard {
    const layout = removeWidgetIdentifiersInLayout(dashboard.layout);

    return {
        analyticalDashboard: {
            dateFilterConfig: cloneWithSanitizedIds(dashboard.dateFilterConfig),
            filterContextRef: cloneWithSanitizedIds(filterContextRef),
            layout: cloneWithSanitizedIds(layout),
        },
    };
}

export function convertFilterContextToBackend(
    filterContext: IFilterContextDefinition,
): AnalyticalDashboardObjectModel.IFilterContext {
    return {
        filterContext: {
            filters: cloneWithSanitizedIds(filterContext.filters),
        },
    };
}
