// (C) 2019-2020 GoodData Corporation
import { uriRef } from "../../objRef/factory";
import { IWidgetDefinition, IWidget } from "../widget";

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
