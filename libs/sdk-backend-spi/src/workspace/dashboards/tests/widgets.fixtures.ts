// (C) 2019-2022 GoodData Corporation

import { uriRef } from "@gooddata/sdk-model";
import { IWidget, IWidgetDefinition } from "../widget";

export const widgetDefinition: IWidgetDefinition = {
    insight: uriRef("/insight"),
    type: "insight",
    title: "",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
    configuration: {
        hideTitle: false,
    },
};
export const widget: IWidget = {
    ...widgetDefinition,
    uri: "/widget",
    ref: uriRef("/widget"),
    identifier: "widgetId",
};
