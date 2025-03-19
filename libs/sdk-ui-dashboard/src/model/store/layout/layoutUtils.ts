// (C) 2021-2024 GoodData Corporation
import {
    IDashboardLayoutSize,
    IDashboardLayout,
    IDashboardWidget,
    ObjRef,
    areObjRefsEqual,
    IDashboardLayoutItem,
    IWidget,
    isInsightWidget,
    isKpiWidget,
    isRichTextWidget,
    isVisualizationSwitcherWidget,
    isDashboardLayout,
} from "@gooddata/sdk-model";
import { IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

import { ExtendedDashboardWidget, isExtendedDashboardLayoutWidget } from "../../types/layoutTypes.js";
import { ILayoutItemPath, ILayoutCoordinates } from "../../../types.js";

export function getWidgetCoordinates(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    ref: ObjRef,
): ILayoutItemPath | undefined {
    const itemData = getWidgetCoordinatesAndItem(layout, ref);

    if (itemData) {
        return itemData.layoutPath;
    }
    return undefined;
}

export function getWidgetsOfType(
    layout: IDashboardLayout<IDashboardWidget>,
    types: string[],
): IDashboardWidget[] {
    const result = [];
    for (let sectionIndex = 0; sectionIndex < layout.sections.length; sectionIndex++) {
        const section = layout.sections[sectionIndex];

        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
            const item = section.items[itemIndex];

            if (item.widget?.type !== undefined && types.includes(item.widget?.type)) {
                result.push(item.widget);
            }

            if (isDashboardLayout(item.widget)) {
                result.push(...getWidgetsOfType(item.widget, types));
            }
        }
    }

    return result;
}

export interface ILayoutItemWithPath {
    item: IDashboardLayoutItem<ExtendedDashboardWidget>;
    layoutPath: ILayoutItemPath;
}

const processLayout = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    ref: ObjRef,
    path: ILayoutCoordinates[],
): ILayoutItemWithPath | undefined => {
    for (let sectionIndex = 0; sectionIndex < layout.sections.length; sectionIndex++) {
        const section = layout.sections[sectionIndex];

        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
            const item = section.items[itemIndex];
            const layoutPath: ILayoutItemPath = [
                ...path,
                {
                    sectionIndex,
                    itemIndex,
                },
            ];

            if (areObjRefsEqual(item.widget?.ref, ref)) {
                return {
                    layoutPath,
                    item,
                };
            }

            if (isDashboardLayout(item.widget)) {
                const result = processLayout(item.widget, ref, layoutPath);
                if (result !== undefined) {
                    return result;
                }
            }
        }
    }

    return undefined;
};

export function getWidgetCoordinatesAndItem(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    ref: ObjRef,
): ILayoutItemWithPath | undefined {
    return processLayout(layout, ref, []);
}

export function isItemWithBaseWidget(
    obj: IDashboardLayoutItem<ExtendedDashboardWidget>,
): obj is IDashboardLayoutItem<IWidget> {
    const widget = obj.widget;

    return (
        isInsightWidget(widget) ||
        isKpiWidget(widget) ||
        isRichTextWidget(widget) ||
        isVisualizationSwitcherWidget(widget) ||
        isExtendedDashboardLayoutWidget(widget)
    );
}

export function resizeInsightWidget(
    size: IDashboardLayoutSize,
    sizeInfo: IVisualizationSizeInfo,
): IDashboardLayoutSize {
    const { width, height } = sizeInfo;
    const { heightAsRatio } = size;
    let { gridWidth = 0, gridHeight } = size;

    //width
    if (width.max && gridWidth > width.max) {
        gridWidth = width.max;
    }
    if (width.min && gridWidth < width.min) {
        gridWidth = width.min;
    }

    //height
    if (!heightAsRatio) {
        if (height.max && (gridHeight || 0) > height.max) {
            gridHeight = height.max;
        }
        if (height.min && (gridHeight || 0) < height.min) {
            gridHeight = height.min;
        }
    }

    return {
        gridWidth,
        gridHeight,
        heightAsRatio,
    };
}
