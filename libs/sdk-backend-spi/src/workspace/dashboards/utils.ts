// (C) 2019-2022 GoodData Corporation
import {
    IWidget,
    IWidgetDefinition,
    isWidget,
    isWidgetDefinition,
    IDashboardLayout,
    IDashboardLayoutItem,
    IDashboardLayoutSection,
    isDashboardLayout,
    IDashboardWidget,
} from "@gooddata/sdk-model";
import noop from "lodash/noop.js";

/**
 * Has dashboard layout only empty sections and widgets?
 * @alpha
 */
export const isDashboardLayoutEmpty = (layout: IDashboardLayout<any>): boolean => {
    return layout.sections.every((section) => section.items.length === 0);
};

/**
 * Represents nested path in layout
 * It's useful to track the layout location of the widget
 * Example: ["sections", 0, "items", 2, "widget"] points to the third item widget in first section
 * @alpha
 */
export type LayoutPath = Array<string | number>;

/**
 * Walk dashboard layout
 * This is useful to collect widgets from the layout or perform transforms on the layout
 *
 * @alpha
 * @param layout - dashboard layout
 * @param callbacks - walk callbacks
 * @returns void
 */
export function walkLayout<TWidget extends IDashboardWidget>(
    layout: IDashboardLayout<TWidget>,
    {
        sectionCallback = noop,
        itemCallback = noop,
        widgetCallback = noop,
    }: {
        sectionCallback?: (section: IDashboardLayoutSection<TWidget>, sectionPath: LayoutPath) => void;
        itemCallback?: (item: IDashboardLayoutItem<TWidget>, widgetPath: LayoutPath) => void;
        widgetCallback?: (widget: TWidget, widgetPath: LayoutPath) => void;
    },
    path: LayoutPath = ["sections"],
): void {
    layout.sections.forEach((section, sectionIndex) => {
        const sectionPath = [...path, sectionIndex];
        sectionCallback(section, sectionPath);
        section.items.forEach((item, widgetIndex) => {
            const itemPath = [...sectionPath, "items", widgetIndex];
            itemCallback(item, itemPath);
            if (isWidget(item.widget) || isWidgetDefinition(item.widget)) {
                const widgetPath = [...itemPath, "widget"];
                widgetCallback(item.widget, widgetPath);
            } else if (isDashboardLayout<TWidget>(item.widget)) {
                // is another layout
                walkLayout(
                    item.widget,
                    {
                        sectionCallback,
                        itemCallback,
                        widgetCallback,
                    },
                    [...itemPath, "widget", "sections"],
                );
            }
        });
    });
}

/**
 * Widget with it's layout path
 * @alpha
 */
export interface IWidgetWithLayoutPath<TWidget = IDashboardWidget> {
    path: LayoutPath;
    widget: TWidget;
}

/**
 * Get all dashboard widgets
 * (layout does not only specify rendering, but also all used widgets)
 *
 * @alpha
 * @param layout - dashboard layout
 * @param collectedWidgets - bag for collecting widgets recursively from the layout
 * @returns - widgets with layout paths
 */
export function layoutWidgetsWithPaths<TWidget extends IDashboardWidget>(
    layout: IDashboardLayout<TWidget>,
): IWidgetWithLayoutPath<TWidget>[] {
    const collectedWidgets: IWidgetWithLayoutPath<TWidget>[] = [];
    walkLayout(layout, {
        widgetCallback: (widget, path) =>
            collectedWidgets.push({
                widget,
                path,
            }),
    });

    return collectedWidgets;
}

/**
 * @alpha
 */
export function layoutWidgets<TWidget extends IDashboardWidget>(
    layout: IDashboardLayout<TWidget>,
): Array<IWidgetDefinition | IWidget>;

/**
 * Get all dashboard widgets
 * (layout does not only specify rendering, but also all used widgets)
 *
 * @alpha
 * @param layout - dashboard layout
 * @returns - widgets
 */
export function layoutWidgets<TWidget extends IDashboardWidget>(
    layout: IDashboardLayout<TWidget>,
): Array<TWidget> {
    const collectedWidgets: Array<TWidget> = [];
    walkLayout(layout, {
        widgetCallback: (widget) => collectedWidgets.push(widget),
    });

    return collectedWidgets;
}
