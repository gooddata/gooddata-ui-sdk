// (C) 2025 GoodData Corporation

import { IDashboardLayout } from "@gooddata/sdk-model";

import { widgetSlideTransformer } from "./widgetSlideTransformer.js";

/**
 * Returns definition of whole layout with single widget.
 */
export function singleWidgetTransformer<TWidget>(
    layout: IDashboardLayout<TWidget>,
    widget: TWidget,
): IDashboardLayout<TWidget> {
    return {
        ...layout,
        type: "IDashboardLayout",
        sections: [
            ...widgetSlideTransformer({
                type: "IDashboardLayoutItem",
                widget,
                size: {
                    xl: { gridWidth: 12, gridHeight: 22 },
                },
            }),
        ],
    };
}
