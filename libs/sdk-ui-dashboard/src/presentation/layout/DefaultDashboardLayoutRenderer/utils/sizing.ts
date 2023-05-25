// (C) 2019-2023 GoodData Corporation
import {
    AnalyticalWidgetType,
    IDashboardLayout,
    IDashboardLayoutItem,
    IDashboardLayoutSection,
    IDashboardLayoutSize,
    IDashboardLayoutSizeByScreenSize,
    isDashboardLayout,
    ISettings,
    isWidget,
    isWidgetDefinition,
    ScreenSize,
} from "@gooddata/sdk-model";
import { fluidLayoutDescriptor } from "@gooddata/sdk-ui-ext";
import clamp from "lodash/clamp.js";
import flatten from "lodash/flatten.js";
import isEqual from "lodash/isEqual.js";
import isNil from "lodash/isNil.js";
import round from "lodash/round.js";
import { invariant } from "ts-invariant";

import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../../_staging/dashboard/fluidLayout/index.js";
import { DashboardLayoutBuilder } from "../../../../_staging/dashboard/fluidLayout/builder/layout.js";
import { IDashboardLayoutItemFacade } from "../../../../_staging/dashboard/fluidLayout/facade/interfaces.js";
import { DashboardLayoutFacade } from "../../../../_staging/dashboard/fluidLayout/facade/layout.js";
import {
    getDashboardLayoutItemHeightForGrid,
    MeasurableWidgetContent,
    getSizeInfo,
    getDashboardLayoutWidgetMinGridWidth,
    getDashboardLayoutWidgetMinGridHeight,
    getDashboardLayoutWidgetMaxGridHeight,
} from "../../../../_staging/layout/sizing.js";
import {
    ALL_SCREENS,
    DASHBOARD_LAYOUT_CONTAINER_WIDTHS,
    DASHBOARD_LAYOUT_MAX_HEIGHT_AS_RATIO_XS,
} from "../../../constants/index.js";

/**
 * Unify dashboard layout items height for all screens.
 *
 * @param items - dashboard layout items
 */
export function unifyDashboardLayoutItemHeights<TWidget>(
    layout: IDashboardLayout<TWidget>,
): IDashboardLayout<TWidget>;
export function unifyDashboardLayoutItemHeights<TWidget>(
    items: IDashboardLayoutItem<TWidget>[],
): IDashboardLayoutItem<TWidget>[];
export function unifyDashboardLayoutItemHeights<TWidget>(
    itemsOrLayout: IDashboardLayout<TWidget> | IDashboardLayoutItem<TWidget>[],
): IDashboardLayout<TWidget> | IDashboardLayoutItem<TWidget>[] {
    if (isDashboardLayout<TWidget>(itemsOrLayout)) {
        const updatedLayout: IDashboardLayout<TWidget> = {
            ...itemsOrLayout,
            sections: DashboardLayoutFacade.for(itemsOrLayout)
                .sections()
                .reduce((acc: IDashboardLayoutSection<TWidget>[], section) => {
                    acc.push({
                        ...section.raw(),
                        items: unifyDashboardLayoutItemHeights(section.items().raw()),
                    });
                    return acc;
                }, []),
        };

        return updatedLayout;
    }

    const itemsWithSizeForAllScreens = itemsOrLayout.map((item) => ({
        ...item,
        size: implicitLayoutItemSizeFromXlSize(item.size.xl),
    }));

    const itemsWithUnifiedHeightForAllScreens: IDashboardLayoutItem<TWidget>[] = ALL_SCREENS.reduce(
        (acc, screen) => {
            const itemsAsFutureGridRows = splitDashboardLayoutItemsAsRenderedGridRows(acc, screen);

            return flatten(
                itemsAsFutureGridRows.map((futureGridRow) =>
                    unifyDashboardLayoutItemHeightsForScreen(futureGridRow, screen),
                ),
            );
        },
        itemsWithSizeForAllScreens,
    );

    return itemsWithUnifiedHeightForAllScreens;
}

/**
 * Derive dashboard layout size for all screens from dashboard layout size defined for xl screen.
 *
 * @param xlSize - dashboard layout size for xl screen
 */
function implicitLayoutItemSizeFromXlSize(xlSize: IDashboardLayoutSize): IDashboardLayoutSizeByScreenSize {
    const xlWidth = xlSize.gridWidth;
    const xlHeight = xlSize.gridHeight;
    const ratio = xlSize.heightAsRatio;

    switch (xlWidth) {
        case 0:
            return dashboardLayoutItemSizeForAllScreens(0, 0, 0, 0, 0, 0, 0);
        case 1:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 2, 6, 12);
        case 2:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 4, 6, 12);
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 6, 12, 12);
        case 10:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 12, 12, 12);
        case 11:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 12, 12, 12);
        case 12:
            return dashboardLayoutItemSizeForAllScreens(ratio, xlHeight, xlWidth, xlWidth, 12, 12, 12);
        default:
            invariant(false, `Unsupported xlWidth: ${xlWidth}`);
    }
}

/**
 * Create dashboard layout item size for all screens,
 * with identical height, defined as ratio,
 * but different width, defined as grid items count.
 *
 * @param heightAsRatio - height as ratio to the width, defined in percents
 * @param gridHeight - height as number of grid rows
 * @param xl - width as grid items count for xl screen
 * @param lg - width as grid items count for lg screen
 * @param md - width as grid items count for md screen
 * @param sm - width as grid items count for sm screen
 * @param xs - width as grid items count for xs screen
 */
function dashboardLayoutItemSizeForAllScreens(
    heightAsRatio: number | undefined,
    gridHeight: number | undefined,
    xl: number,
    lg: number,
    md: number,
    sm: number,
    xs: number,
): IDashboardLayoutSizeByScreenSize {
    if (gridHeight) {
        return {
            xl: {
                gridWidth: xl,
                gridHeight,
            },
            lg: {
                gridWidth: lg,
                gridHeight,
            },
            md: {
                gridWidth: md,
                gridHeight,
            },
            sm: {
                gridWidth: sm,
                gridHeight,
            },
            xs: {
                gridWidth: xs,
                gridHeight,
            },
        };
    }
    return {
        xl: {
            gridWidth: xl,
            heightAsRatio,
        },
        lg: {
            gridWidth: lg,
            heightAsRatio,
        },
        md: {
            gridWidth: md,
            heightAsRatio,
        },
        sm: {
            gridWidth: sm,
            heightAsRatio,
        },
        xs: {
            gridWidth: xs,
            heightAsRatio,
        },
    };
}

/**
 * Divide the items into a list representing the future rows of the grid.
 * This is useful for performing item transformations, depending on how they really appear in the grid.
 *
 * @param items - dashboard layout items
 * @param screen - responsive screen class
 */
export function splitDashboardLayoutItemsAsRenderedGridRows<TWidget>(
    items: IDashboardLayoutItem<TWidget>[],
    screen: ScreenSize,
): IDashboardLayoutItem<TWidget>[][] {
    const renderedRows: IDashboardLayoutItem<TWidget>[][] = [];

    let currentRowWidth = 0;
    let currentRow: IDashboardLayoutItem<TWidget>[] = [];

    items.forEach((item) => {
        const itemSize = item.size[screen];

        if (isNil(itemSize)) {
            throw Error("Item size for current screen is undefined");
        }

        if (currentRowWidth + itemSize.gridWidth > DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT) {
            renderedRows.push(currentRow);
            currentRow = [];
            currentRowWidth = 0;
        }

        currentRow.push(item);
        currentRowWidth = currentRowWidth + itemSize.gridWidth;
    });

    if (currentRow.length > 0) {
        renderedRows.push(currentRow);
    }

    return renderedRows;
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
    const itemSizeForCurrentScreen = item.size[screen];
    const heightAsRatio = itemSizeForCurrentScreen?.gridWidth
        ? round(maxHeight / itemSizeForCurrentScreen.gridWidth, 2)
        : 0;

    let updatedColumn = item;

    if (
        !itemSizeForCurrentScreen?.gridHeight &&
        !isNil(itemSizeForCurrentScreen?.heightAsRatio) &&
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
                    ...updatedColumn.size[screen],
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
): ItemPosition[] => {
    const originalLayoutFacade = DashboardLayoutFacade.for(originalLayout);
    return DashboardLayoutFacade.for(resizedLayout)
        .sections()
        .reduce((acc: ItemPosition[], section) => {
            return section.items().reduce((acc, item) => {
                const originalColumn = originalLayoutFacade
                    .sections()
                    .section(section.index())!
                    .items()
                    .item(item.index());

                // if this bombs there is something wrong with the layout
                invariant(originalColumn);

                const originalContent = originalColumn.widget();
                const updatedContent = item.widget();

                // Is nested layout?
                if (isDashboardLayout(originalContent) && isDashboardLayout(updatedContent)) {
                    return getResizedItemPositions(originalContent, updatedContent, positions);
                }

                if (
                    !isEqual(originalColumn.size(), item.size()) &&
                    (isWidget(updatedContent) || isWidgetDefinition(updatedContent))
                ) {
                    acc.push([item.section().index(), item.index()]);
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

    for (const sectionItem of sectionItems) {
        const newWidth = sectionItem.sizeForScreen(screen)!.gridWidth + gridRowWidth;

        if (newWidth <= DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT) {
            if (sectionItem.index() === item.index()) {
                break;
            }
            gridRowWidth = newWidth;
        } else {
            if (sectionItem.index() === item.index()) {
                return DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
            }
            // TODO is this default ok?
            gridRowWidth = sectionItem.sizeForScreen(screen)?.gridWidth ?? 1;
        }
    }

    return DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT - gridRowWidth;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const validWidth = currentWidth !== undefined ? clamp(currentWidth, minWidth, maxWidth) : currentWidth;
    const validHeight =
        currentHeight !== undefined ? clamp(currentHeight, minHeight, maxHeight) : currentHeight;
    return {
        validWidth,
        validHeight,
    };
}
