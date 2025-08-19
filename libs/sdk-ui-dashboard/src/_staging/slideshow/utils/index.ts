// (C) 2022-2025 GoodData Corporation
import {
    IDashboardLayout,
    IWidget,
    isDashboardLayout,
    isInsightWidget,
    isKpiWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
} from "@gooddata/sdk-model";

/**
 * This function checks if the layout widget contains a visualization switcher somewhere in its structure.
 *
 * @param widget - widget to check
 */
export function containsVisualizationSwitcher<TWidget>(widget: TWidget) {
    if (!isDashboardLayout(widget)) {
        return false;
    }
    for (const section of widget.sections) {
        for (const item of section.items) {
            if (isDashboardLayout(item.widget)) {
                return containsVisualizationSwitcher(item.widget);
            } else if (isVisualizationSwitcherWidget(item.widget)) {
                return true;
            }
        }
    }
    return false;
}

function getAllWidgetsFromLayout<TWidget>(layout: IDashboardLayout<TWidget>): IWidget[] {
    return layout.sections.flatMap((section) =>
        section.items.flatMap((item) => {
            const widget = item.widget;
            if (!widget) return [];

            if (isKpiWidget(widget) || isInsightWidget(widget) || isRichTextWidget(widget)) {
                return [widget];
            } else if (isVisualizationSwitcherWidget(widget)) {
                return [widget, ...widget.visualizations];
            } else if (isDashboardLayout(widget)) {
                return [...getAllWidgetsFromLayout(widget)];
            } else {
                return [];
            }
        }),
    );
}

/**
 * This function is used to find a focused widget in the layout structure.
 *
 * @param layout - dashboard layout
 * @param widgetId - widget identifier to find
 * @returns
 */
export const findFocusedWidget = <TWidget>(
    layout: IDashboardLayout<TWidget>,
    widgetId: string | undefined,
): TWidget | undefined => {
    if (!widgetId) {
        return undefined;
    }

    const allWidgets = getAllWidgetsFromLayout(layout);
    return allWidgets.find((widget) => widget.identifier === widgetId) as TWidget;
};
