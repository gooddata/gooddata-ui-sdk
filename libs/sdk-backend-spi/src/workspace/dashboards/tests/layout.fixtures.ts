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
        rows: [
            {
                columns: [
                    {
                        content: layoutWidget,
                        size: {
                            xl: {
                                width: 12,
                            },
                        },
                    },
                ],
            },
        ],
    },
};

export const fluidLayoutDefinition: IFluidLayoutDefinition = {
    fluidLayout: {
        rows: [
            {
                columns: [
                    {
                        content: {
                            widget,
                        },
                        size: {
                            xl: {
                                width: 12,
                            },
                        },
                    },
                    {
                        content: layoutWidgetDefinition,
                        size: {
                            xl: {
                                width: 12,
                            },
                        },
                    },
                ],
            },
        ],
    },
};
