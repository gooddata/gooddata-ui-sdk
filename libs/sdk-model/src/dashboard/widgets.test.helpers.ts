// (C) 2019-2026 GoodData Corporation

import { uriRef } from "../objRef/factory.js";

import { type IWidget, type IWidgetDefinition } from "./widget.js";

export const widgetDefinition: IWidgetDefinition = {
    insight: uriRef("/insight"),
    type: "insight",
    title: "",
    description: "",
    drills: [],
    ignoreDashboardFilters: [],
};
export const widget: IWidget = {
    ...widgetDefinition,
    uri: "/widget",
    ref: uriRef("/widget"),
    identifier: "widgetId",
};
