// (C) 2019-2026 GoodData Corporation

import { clamp, isEqual, round } from "lodash-es";
import { invariant } from "ts-invariant";

import {
    type AnalyticalWidgetType,
    type IDashboardLayout,
    type IDashboardLayoutItem,
    type IDashboardLayoutSection,
    type IDashboardLayoutSize,
    type IDashboardLayoutSizeByScreenSize,
    type ISettings,
    type ScreenSize,
    isDashboardLayout,
    isWidget,
    isWidgetDefinition,
} from "@gooddata/sdk-model";
import { fluidLayoutDescriptor } from "@gooddata/sdk-ui-ext";

import { DashboardLayoutBuilder } from "../../../../_staging/dashboard/flexibleLayout/builder/layout.js";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../../_staging/dashboard/flexibleLayout/config.js";
import { type IDashboardLayoutItemFacade } from "../../../../_staging/dashboard/flexibleLayout/facade/interfaces.js";
import { DashboardLayoutFacade } from "../../../../_staging/dashboard/flexibleLayout/facade/layout.js";
import { getItemIndex } from "../../../../_staging/layout/coordinates.js";
import {
    type MeasurableWidgetContent,
    determineSizeForScreen,
    getDashboardLayoutItemHeightForGrid,
    getDashboardLayoutWidgetMaxGridHeight,
    getDashboardLayoutWidgetMinGridHeight,
    getDashboardLayoutWidgetMinGridWidth,
    getSizeInfo,
    implicitLayoutItemSizeFromXlSize,
    splitDashboardLayoutItemsAsRenderedGridRows,
} from "../../../../_staging/layout/sizing.js";
import { type ILayoutItemPath } from "../../../../types.js";
import {
    ALL_SCREENS,
    DASHBOARD_LAYOUT_CONTAINER_WIDTHS,
    DASHBOARD_LAYOUT_MAX_HEIGHT_AS_RATIO_XS,
} from "../../../constants/layout.js";

/**
 * Unify dashboard layout items height for all screens.
 *
 * @param layout - dashboard layout with items
 @param layoutSize - the size of layout, undefined if the items are in the root layout
 * @param parentLayoutPath - path to a layout item the layout is nested in, undefined when root layout is processed.
 */
export function unifyDashboardLayoutItemHeights<TWidget>(
    layout: IDashboardLayout<TWidget>,
    parentLayoutSize: IDashboardLayoutSizeByScreenSize | undefined,
    parentLayoutPath: ILayoutItemPath | undefined,
): IDashboardLayout<TWidget>;
export function unifyDashboardLayoutItemHeights<TWidget>(
    items: IDashboardLayoutItem<TWidget>[],
    parentLayoutSize: IDashboardLayoutSizeByScreenSize | undefined,
    parentLayoutPath: ILayoutItemPath | undefined,
): IDashboardLayoutItem<TWidget>[];
export function unifyDashboardLayoutItemHeights<TWidget>(
    itemsOrLayout: IDashboardLayout<TWidget> | IDashboardLayoutItem<TWidget>[],
    parentLayoutSize: IDashboardLayoutSizeByScreenSize | undefined,
    parentLayoutPath: ILayoutItemPath | undefined,
): IDashboardLayout<TWidget> | IDashboardLayoutItem<TWidget>[] {
    if (isDashboardLayout<TWidget>(itemsOrLayout)) {
        return {
            ...itemsOrLayout,
            sections: DashboardLayoutFacade.for(itemsOrLayout, parentLayoutPath)
                .sections()
                .reduce((acc: IDashboardLayoutSection<TWidget>[], section) => {
                    acc.push({
                        ...section.raw(),
                        items: unifyDashboardLayoutItemHeights(
                            section.items().raw(),
                            parentLayoutSize,
                            parentLayoutPath,
                        ),
                    });
                    return acc;
                }, []),
        };
    }

    const itemsWithSizeForAllScreens = itemsOrLayout.map((item) => ({
        ...item,
        size: implicitLayoutItemSizeFromXlSize(item.size.xl),
    }));

    // items with unified height for all screens
    return ALL_SCREENS.reduce((acc, screen) => {
        const itemsAsFutureGridRows = splitDashboardLayoutItemsAsRenderedGridRows(
            acc,
            parentLayoutSize,
            screen,
        );

        return itemsAsFutureGridRows.flatMap((futureGridRow) =>
            unifyDashboardLayoutItemHeightsForScreen(futureGridRow, screen),
        );
    }, itemsWithSizeForAllScreens);
}

/**
 * Calculate dashboard layout item height for the provided screen.
 * Result, if custom height is defined, is height of the item, defined
 * as grid items count, multiplied by {@link GRID_ROW_HEIGHT_IN_PX} or width of the item,
 * defined as grid items count, multiplied by height, defined as a ratio.
 *
 * @param item - dashboard layout item
 * @param screen - responsive screen class
 */
function dashboardLayoutItemHeightForScreen<TWidget>(
    item: IDashboardLayoutItem<TWidget>,
    screen: ScreenSize,
) {
    const { gridWidth, gridHeight, heightAsRatio = 0 } = item.size?.[screen] ?? {};
    if (!gridWidth) {
        return 0;
    }

    if (gridHeight) {
        return getDashboardLayoutItemHeightForGrid(gridHeight);
    }

    return gridWidth * heightAsRatio;
}

/**
 * Unify dashboard layout items height, defined as ratio, for the provided screen.
 * It overrides height of all items to the highest item height found for the provided screen.
 *
 * @param items - dashboard layout items
 * @param screen -  responsive screen class
 */
function unifyDashboardLayoutItemHeightsForScreen<TWidget>(
    items: IDashboardLayoutItem<TWidget>[],
    screen: ScreenSize,
): IDashboardLayoutItem<TWidget>[] {
    const heights = items.map((item) => dashboardLayoutItemHeightForScreen(item, screen));
    const maxHeight = Math.max(0, ...heights);

    if (maxHeight === 0) {
        return items;
    }

    return items.map((item) => updateDashboardLayoutItemHeight(item, screen, maxHeight));
}

const updateDashboardLayoutItemHeight = <TWidget>(
    item: IDashboardLayoutItem<TWidget>,
    screen: ScreenSize,
    maxHeight: number,
): IDashboardLayoutItem<TWidget> => {
    const itemSizeForCurrentScreen = determineSizeForScreen(screen, item.size);
    const heightAsRatio = itemSizeForCurrentScreen?.gridWidth
        ? round(maxHeight / itemSizeForCurrentScreen.gridWidth, 2)
        : 0;

    let updatedColumn = item;

    if (
        !itemSizeForCurrentScreen?.gridHeight &&
        !(
            itemSizeForCurrentScreen?.heightAsRatio === null ||
            itemSizeForCurrentScreen?.heightAsRatio === undefined
        ) &&
        itemSizeForCurrentScreen?.heightAsRatio !== heightAsRatio
    ) {
        if (isWidget(updatedColumn.widget) || isWidgetDefinition(updatedColumn.widget)) {
            updatedColumn = {
                ...updatedColumn,
                widget: {
                    ...updatedColumn.widget,
                },
            };
        }

        updatedColumn = {
            ...updatedColumn,
            size: {
                ...updatedColumn.size,
                [screen]: {
                    ...determineSizeForScreen(screen, updatedColumn.size),
                    heightAsRatio,
                },
            },
        };
    }

    if (screen === "xs" && heightAsRatio > DASHBOARD_LAYOUT_MAX_HEIGHT_AS_RATIO_XS) {
        updatedColumn = {
            ...updatedColumn,
            size: {
                ...updatedColumn.size,
                xs: {
                    ...updatedColumn.size.xs!,
                    heightAsRatio: DASHBOARD_LAYOUT_MAX_HEIGHT_AS_RATIO_XS,
                },
            },
        };
    }

    return updatedColumn;
};

/**
 * Tuple that represents a item position in the layout
 * [sectionIndex, itemIndex]
 *
 * @internal
 */
type ItemPosition = [number, number];

/**
 *
 * @internal
 */
export const getResizedItemPositions = <TWidget>(
    originalLayout: IDashboardLayout<TWidget>,
    resizedLayout: IDashboardLayout<TWidget>,
    positions: ItemPosition[] = [],
    parentLayoutPath: ILayoutItemPath | undefined,
): ItemPosition[] => {
    const originalLayoutFacade = DashboardLayoutFacade.for(originalLayout, parentLayoutPath);
    return DashboardLayoutFacade.for(resizedLayout, parentLayoutPath)
        .sections()
        .reduce((acc: ItemPosition[], section) => {
            return section.items().reduce((acc, item) => {
                const originalColumn = originalLayoutFacade
                    .sections()
                    .section(section.index().sectionIndex)!
                    .items()
                    .item(getItemIndex(item.index()));

                // if this bombs there is something wrong with the layout
                invariant(originalColumn);

                const originalContent = originalColumn.widget();
                const updatedContent = item.widget();

                // Is nested layout?
                if (isDashboardLayout(originalContent) && isDashboardLayout(updatedContent)) {
                    return getResizedItemPositions(originalContent, updatedContent, positions, item.index());
                }

                if (
                    !isEqual(originalColumn.size(), item.size()) &&
                    (isWidget(updatedContent) || isWidgetDefinition(updatedContent))
                ) {
                    acc.push([item.section().index().sectionIndex, getItemIndex(item.index())]);
                }

                return acc;
            }, acc);
        }, positions);
};

export const getDashboardLayoutItemHeightForRatioAndScreen = (
    size: IDashboardLayoutSize,
    screen: ScreenSize,
): number => {
    // TODO is this default ok?
    const { gridWidth, heightAsRatio = 1 } = size;
    const actualWidth = DASHBOARD_LAYOUT_CONTAINER_WIDTHS[screen];

    const actualColumnUnitWidth = actualWidth / DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
    return actualColumnUnitWidth * gridWidth * (heightAsRatio / 100);
};

export function getDashboardLayoutItemMaxGridWidth(
    item: IDashboardLayoutItemFacade<any>,
    screen: ScreenSize,
): number {
    let gridRowWidth = 0;
    const sectionItems = item.section().items().all();

    const parentLayout = item.section().layout();
    // TODO LX: 664 should not use size() here but new layout method sizeForScreen()
    const maxGridWidth = parentLayout.size()?.gridWidth ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;

    for (const sectionItem of sectionItems) {
        const newWidth = sectionItem.sizeForScreen(screen)!.gridWidth + gridRowWidth;

        if (newWidth <= maxGridWidth) {
            if (getItemIndex(sectionItem.index()) === getItemIndex(item.index())) {
                break;
            }
            gridRowWidth = newWidth;
        } else {
            if (getItemIndex(sectionItem.index()) === getItemIndex(item.index())) {
                return maxGridWidth;
            }
            gridRowWidth = sectionItem.sizeForScreen(screen)?.gridWidth ?? 1;
        }
    }

    return maxGridWidth - gridRowWidth;
}

export function getDashboardLayoutWidgetDefaultGridWidth(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent, // undefined for placeholders
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.width.default!;
}

export function getLayoutWithoutGridHeights<TWidget>(
    layout: IDashboardLayout<TWidget>,
): IDashboardLayout<TWidget> {
    const layoutBuilder = DashboardLayoutBuilder.for(layout);
    return layoutBuilder
        .modifySections((section) =>
            section.modifyItems((itemBuilder, itemFacade) => {
                const widget = itemFacade.widget();
                if (isDashboardLayout(widget)) {
                    const updatedLayout = getLayoutWithoutGridHeights(widget) as unknown as TWidget;
                    return itemBuilder.widget(updatedLayout);
                }

                const itemWithoutGridHeight = removeGridHeightFromItemSize(itemFacade.raw());
                return itemBuilder.setItem(itemWithoutGridHeight);
            }),
        )
        .build();
}

function removeGridHeightFromItemSize<TWidget>(item: IDashboardLayoutItem<TWidget>) {
    // oxlint-disable-next-line @typescript-eslint/no-unused-vars
    const { gridHeight, ...rest } = item.size.xl;

    return {
        ...item,
        size: {
            ...item.size,
            xl: {
                ...rest,
            },
        },
    };
}

/**
 * @internal
 */
export function validateDashboardLayoutWidgetSize(
    currentWidth: number,
    currentHeight: number | undefined,
    widgetType: AnalyticalWidgetType,
    widgetContent: MeasurableWidgetContent,
    settings: ISettings,
): {
    validWidth: number;
    validHeight?: number;
} {
    const minWidth = getDashboardLayoutWidgetMinGridWidth(settings, widgetType, widgetContent);
    const maxWidth = fluidLayoutDescriptor.gridColumnsCount;
    const minHeight = getDashboardLayoutWidgetMinGridHeight(settings, widgetType, widgetContent);
    const maxHeight = getDashboardLayoutWidgetMaxGridHeight(settings, widgetType, widgetContent);
    const validWidth = currentWidth === undefined ? currentWidth : clamp(currentWidth, minWidth, maxWidth);
    const validHeight =
        currentHeight === undefined ? currentHeight : clamp(currentHeight, minHeight, maxHeight);
    return {
        validWidth,
        validHeight,
    };
}
