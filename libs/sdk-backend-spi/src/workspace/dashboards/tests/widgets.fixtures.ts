// (C) 2019-2020 GoodData Corporation

import { uriRef } from "@gooddata/sdk-model";
import { IWidget, IWidgetDefinition } from "../widget";

export const widgetDefinition: IWidgetDefinition = {
    insight: uriRef("/insight"),
    type: "insight",
    title: "",
    description: "",
    alerts: [],
    drills: [],
    ignoreDashboardFilters: [],
};

export const createWidget = (id: string): IWidget => {
    const widget: IWidget = {
        ...widgetDefinition,
        ref: uriRef(`/gdc/md/${id}`),
        uri: `/gdc/md/${id}`,
        identifier: id,
    };

    return widget;
};

export const widget = createWidget("widget");
