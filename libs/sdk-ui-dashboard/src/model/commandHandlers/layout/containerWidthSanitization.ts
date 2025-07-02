// (C) 2025 GoodData Corporation

import { IDashboardLayout, ScreenSize, IInsight, ISettings, isDashboardLayout } from "@gooddata/sdk-model";

import { ExtendedDashboardWidget, IItemWithWidth } from "../../types/layoutTypes.js";
import { findItem } from "../../../_staging/layout/coordinates.js";
import { implicitLayoutItemSizeFromXlSize, getMinWidth } from "../../../_staging/layout/sizing.js";
import { ILayoutItemPath } from "../../../types.js";
import { getLayoutConfiguration } from "../../../_staging/dashboard/flexibleLayout/layoutConfiguration.js";
import { ObjRefMap } from "../../../_staging/metadata/objRefMap.js";

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
 * For other widgets (including nested layouts with "row" direction), it returns their paths directly unless
 * the processAllContainers is true.
 *
 * @param layoutItem - The layout item to process
 * @param layoutItemPath - The path to the provided layout item (this could be a nested layout, and we need to know his preceding path)
 * @param processAllContainers - If true, process all containers, including those with a "row" direction, otherwise only process containers with a "column" direction
 */
export function getChildWidgetLayoutPaths(
    layoutItem: IDashboardLayout<ExtendedDashboardWidget>,
    layoutItemPath: ILayoutItemPath,
    processAllContainers = false,
): ILayoutItemPath[] {
    return layoutItem.sections.flatMap((section, sectionIndex) =>
        section.items.flatMap((item, itemIndex) => {
            const currentPath: ILayoutItemPath = [...layoutItemPath, { sectionIndex, itemIndex }];
            return isDashboardLayout(item.widget) &&
                (processAllContainers || getLayoutDirection(item.widget) === "column")
                ? [currentPath, ...getChildWidgetLayoutPaths(item.widget, currentPath, processAllContainers)]
                : [currentPath];
        }),
    );
}

/**
 * Collects layout paths and default minimum widths of all child widgets that need width updates when
 * a nested layout is resized. For nested layouts with a "column" direction, it processes children recursively.
 * For other widgets (including nested layouts with "row" direction), it returns their paths and
 * minimum widths directly.
 */
export function getChildWidgetLayoutPathsWithMinWidths(
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    parentPath: ILayoutItemPath,
    settings: ISettings,
    insightMap: ObjRefMap<IInsight>,
    screen: ScreenSize,
): IItemWithWidth[] {
    return layout.sections.flatMap((section, sectionIndex) =>
        section.items.flatMap((item, itemIndex) => {
            const currentPath: ILayoutItemPath = [...parentPath, { sectionIndex, itemIndex }];
            if (item.widget === undefined) {
                return [];
            }
            if (isDashboardLayout(item.widget) && getLayoutDirection(item.widget) === "column") {
                // For nested layouts with a column direction, process children recursively and include
                // the container itself
                const childItems = getChildWidgetLayoutPathsWithMinWidths(
                    item.widget,
                    currentPath,
                    settings,
                    insightMap,
                    screen,
                );
                const containerMinWidth = getMinWidth(item.widget, insightMap, screen, settings, "column");
                return [...childItems, { itemPath: currentPath, width: containerMinWidth }];
            } else {
                // For other widgets (including nested layouts with a row direction, layout will never be
                // a column at this point), return their path and minimum default width.
                const minWidth = getMinWidth(item.widget, insightMap, screen, settings, "row");
                return [{ itemPath: currentPath, width: minWidth }];
            }
        }),
    );
}
