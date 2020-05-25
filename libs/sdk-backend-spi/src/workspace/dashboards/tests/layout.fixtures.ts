// (C) 2019-2020 GoodData Corporation
import { IFluidLayout, IFluidLayoutDefinition, ILayoutWidget, ILayoutWidgetDefinition } from "../layout";
import { widget, widgetDefinition } from "./widgets.fixtures";

export const layoutWidget: ILayoutWidget = {
    widget,
};

export const layoutWidgetDefinition: ILayoutWidgetDefinition = {
    widget: widgetDefinition,
};

export const fluidLayout: IFluidLayout = {
    fluidLayout: {
        rows: [],
    },
};

export const fluidLayoutDefinition: IFluidLayoutDefinition = {
    fluidLayout: {
        rows: [],
    },
};
