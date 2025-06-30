// (C) 2025 GoodData Corporation

import { IDashboardLayout, ScreenSize, isDashboardLayout } from "@gooddata/sdk-model";

import { ExtendedDashboardWidget, IItemWithWidth } from "../../types/layoutTypes.js";
import { findItem } from "../../../_staging/layout/coordinates.js";
import { implicitLayoutItemSizeFromXlSize } from "../../../_staging/layout/sizing.js";
import { ILayoutItemPath } from "../../../types.js";
import { getLayoutConfiguration } from "../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";

export const getUpdatedSizesOnly = (
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    itemsWithSizes: IItemWithWidth[],
    screen: ScreenSize,
) => {
    return itemsWithSizes.filter(({ itemPath, width }) => {
        const container = findItem(layout, itemPath);
        const sanitizedItemSize = implicitLayoutItemSizeFromXlSize(container.size.xl);
        return sanitizedItemSize[screen]?.gridWidth !== width;
    });
};

const getLayoutDirection = (layout: IDashboardLayout<ExtendedDashboardWidget>) =>
    getLayoutConfiguration(layout).direction;

/**
 * Collects layout paths of all child widgets that need width updates when a nested layout is resized.
 * For nested layouts with a "column" direction, it processes children recursively.
 * For other widgets (including nested layouts with "row" direction), it returns their paths directly.
 */
export function getChildWidgetLayoutPaths(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    parentPath: ILayoutItemPath,
): ILayoutItemPath[] {
    return layout.sections.flatMap((section, sectionIndex) =>
        section.items.flatMap((item, itemIndex) => {
            const currentPath: ILayoutItemPath = [...parentPath, { sectionIndex, itemIndex }];
            return isDashboardLayout(item.widget) && getLayoutDirection(item.widget) === "column"
                ? [...getChildWidgetLayoutPaths(item.widget, currentPath), currentPath]
                : [currentPath];
        }),
    );
}
