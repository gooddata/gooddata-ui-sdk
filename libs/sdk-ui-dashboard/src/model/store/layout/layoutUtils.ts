// (C) 2021-2023 GoodData Corporation
import {
    IDashboardLayoutSize,
    IDashboardLayout,
    ObjRef,
    areObjRefsEqual,
    IDashboardLayoutItem,
    IWidget,
    isInsightWidget,
    isKpiWidget,
} from "@gooddata/sdk-model";
import { IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

import { ExtendedDashboardWidget } from "../../types/layoutTypes.js";
import { ILayoutCoordinates } from "../../../types.js";

export function getWidgetCoordinates(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    ref: ObjRef,
): ILayoutCoordinates | undefined {
    const itemData = getWidgetCoordinatesAndItem(layout, ref);

    if (itemData) {
        return {
            sectionIndex: itemData.sectionIndex,
            itemIndex: itemData.itemIndex,
        };
    }
    return undefined;
}

export function getWidgetCoordinatesAndItem(layout: IDashboardLayout<ExtendedDashboardWidget>, ref: ObjRef) {
    for (let sectionIndex = 0; sectionIndex < layout.sections.length; sectionIndex++) {
        const section = layout.sections[sectionIndex];

        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
            const item = section.items[itemIndex];

            if (areObjRefsEqual(item.widget?.ref, ref)) {
                return {
                    sectionIndex,
                    itemIndex,
                    item,
                };
            }
        }
    }

    return undefined;
}

export function isItemWithBaseWidget(
    obj: IDashboardLayoutItem<ExtendedDashboardWidget>,
): obj is IDashboardLayoutItem<IWidget> {
    const widget = obj.widget;

    return isInsightWidget(widget) || isKpiWidget(widget);
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
