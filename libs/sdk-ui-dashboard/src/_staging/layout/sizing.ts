// (C) 2019-2026 GoodData Corporation

import { invariant } from "ts-invariant";

import {
    type AnalyticalWidgetType,
    type IDashboardLayout,
    type IDashboardLayoutContainerDirection,
    type IDashboardLayoutItem,
    type IDashboardLayoutSize,
    type IDashboardLayoutSizeByScreenSize,
    type IInsight,
    type IInsightDefinition,
    type IKpi,
    type ISettings,
    type IVisualizationSwitcherWidget,
    type ScreenSize,
    widgetType as getWidgetType,
    isDashboardLayout,
    isDashboardWidget,
    isInsight,
    isInsightWidget,
    isKpi,
    isKpiWidget,
    isKpiWithoutComparison,
    isVisualizationSwitcherWidget,
    isWidget,
} from "@gooddata/sdk-model";
import {
    DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT,
    INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    type IVisualizationSizeInfo,
    KPI_WIDGET_SIZE_INFO_DEFAULT,
    MIN_VISUALIZATION_WIDTH,
    RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT,
    VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT,
    fluidLayoutDescriptor,
    getInsightSizeInfo,
} from "@gooddata/sdk-ui-ext";

import {
    GRID_ROW_HEIGHT_IN_PX,
    KPI_WITHOUT_COMPARISON_SIZE_INFO,
    KPI_WITH_COMPARISON_SIZE_INFO,
} from "./constants.js";
import { findItem, hasParent } from "./coordinates.js";
import { type ExtendedDashboardWidget, isCustomWidget } from "../../model/types/layoutTypes.js";
import { type ILayoutItemPath } from "../../types.js";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../dashboard/flexibleLayout/config.js";
import { getLayoutConfiguration } from "../dashboard/flexibleLayout/layoutConfiguration.js";
import { type ObjRefMap } from "../metadata/objRefMap.js";

/**
 * @internal
 */
export type MeasurableWidgetContent = IInsightDefinition | IKpi;

/**
 * @internal
 */
export function getSizeInfo(
    settings: ISettings,
    widgetType: AnalyticalWidgetType | ExtendedDashboardWidget["type"],
    widgetContent?: MeasurableWidgetContent,
): IVisualizationSizeInfo {
    if (widgetType === "kpi") {
        return getKpiSizeInfo(settings, widgetContent);
    } else if (widgetType === "richText") {
        return RICH_TEXT_WIDGET_SIZE_INFO_NEW_DEFAULT;
    } else if (widgetType === "IDashboardLayout") {
        return DASHBOARD_LAYOUT_WIDGET_SIZE_INFO_DEFAULT;
    } else if (widgetType === "visualizationSwitcher" && !widgetContent) {
        return VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_NEW_DEFAULT;
    }

    return getVisualizationSizeInfo(settings, widgetContent);
}

/**
 * @internal
 */
export function getInsightPlaceholderSizeInfo(settings: ISettings): IVisualizationSizeInfo {
    return getVisualizationSizeInfo(settings);
}

function getVisualizationSizeInfo(
    _settings: ISettings,
    insight?: MeasurableWidgetContent,
): IVisualizationSizeInfo {
    let sizeInfo;
    if (isInsight(insight)) {
        sizeInfo = getInsightSizeInfo(insight, _settings);
    }

    if (!sizeInfo) {
        return INSIGHT_WIDGET_SIZE_INFO_NEW_DEFAULT;
    }
    return sizeInfo;
}

function getKpiSizeInfo(_settings: ISettings, kpi?: MeasurableWidgetContent): IVisualizationSizeInfo {
    if (!isKpi(kpi)) {
        return KPI_WIDGET_SIZE_INFO_DEFAULT;
    }
    return isKpiWithoutComparison(kpi) ? KPI_WITHOUT_COMPARISON_SIZE_INFO : KPI_WITH_COMPARISON_SIZE_INFO;
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetDefaultHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent, // undefined for placeholders
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return fluidLayoutDescriptor.toHeightInPx(sizeInfo.height.default!);
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetMinGridHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType | ExtendedDashboardWidget["type"],
    widgetContent?: MeasurableWidgetContent,
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.height.min!;
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetMaxGridHeight(
    settings: ISettings,
    widgetType: AnalyticalWidgetType | ExtendedDashboardWidget["type"],
    widgetContent?: MeasurableWidgetContent,
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.height.max!;
}

function getSectionHeight(
    rows: IDashboardLayoutItem<ExtendedDashboardWidget>[][],
    screen: ScreenSize,
    emptyLayoutMinHeight: number,
) {
    return rows.reduce((allRowsHeight, row) => {
        const currentRowHeight = getRowHeight(row, screen, emptyLayoutMinHeight);
        return allRowsHeight + currentRowHeight;
    }, 0);
}

function getRowHeight(
    row: IDashboardLayoutItem<ExtendedDashboardWidget>[],
    screen: ScreenSize,
    emptyLayoutMinHeight: number,
) {
    return row.reduce((maxRowItemHeight, item) => {
        const sanitizedItemSize = implicitLayoutItemSizeFromXlSize(item.size.xl);
        const currentItemHeight = sanitizedItemSize[screen]?.gridHeight ?? emptyLayoutMinHeight;
        return Math.max(maxRowItemHeight, currentItemHeight);
    }, 0);
}

export function getContainerHeight(
    container: IDashboardLayoutItem<ExtendedDashboardWidget>,
    screen: ScreenSize,
    settings: ISettings,
): number {
    const emptyLayoutMinHeight = getDashboardLayoutWidgetMinGridHeight(settings, container.widget!.type);
    if (!isDashboardLayout(container.widget) || container.widget.sections.length === 0) {
        return emptyLayoutMinHeight;
    }
    return container.widget.sections.reduce((allSectionsHeight, section) => {
        const allScreenSizes = implicitLayoutItemSizeFromXlSize(container.size.xl);
        const rows = splitDashboardLayoutItemsAsRenderedGridRows(section.items, allScreenSizes, screen);
        const currentSectionHeight = getSectionHeight(rows, screen, emptyLayoutMinHeight);
        return allSectionsHeight + currentSectionHeight;
    }, 0);
}

/**
 * @internal
 */
export function getMinHeight(
    widgets: IDashboardLayoutItem<ExtendedDashboardWidget>[],
    insightMap: ObjRefMap<IInsight>,
    screen: ScreenSize,
    settings: ISettings,
    defaultMin = 0,
): number {
    const minimumHeights: number[] = widgets
        .filter((layoutItem) => isDashboardWidget(layoutItem.widget))
        .map((layoutItem) => {
            const widget = layoutItem.widget!;
            if (isVisualizationSwitcherWidget(widget) && widget.visualizations.length > 0) {
                return Math.max(
                    ...getVisSwitcherDimension(
                        widget,
                        insightMap,
                        getDashboardLayoutWidgetMinGridHeight,
                        settings,
                    ),
                );
            } else if (isDashboardLayout(widget)) {
                return getContainerHeight(layoutItem, screen, settings);
            }
            return getDashboardLayoutWidgetMinGridHeight(
                settings,
                getExtendedWidgetType(widget),
                getWidgetContent(widget, insightMap),
            );
        });

    return Math.max(defaultMin, ...minimumHeights);
}

const MAXIMUM_HEIGHT_OF_ROW_WITH_NESTED_WIDGETS = 2000;

function getExtendedWidgetType(
    widget: ExtendedDashboardWidget,
): AnalyticalWidgetType | ExtendedDashboardWidget["type"] {
    return isWidget(widget) ? getWidgetType(widget) : widget.type;
}

function getWidgetContent(widget: ExtendedDashboardWidget, insightMap: ObjRefMap<IInsight>) {
    if (isKpiWidget(widget)) {
        return widget.kpi;
    } else if (isInsightWidget(widget)) {
        return insightMap.get(widget.insight);
    }
    return undefined;
}

/**
 * @internal
 */
export function getMaxHeight(
    layoutItems: IDashboardLayoutItem<ExtendedDashboardWidget>[],
    insightMap: ObjRefMap<IInsight>,
    screen: ScreenSize,
    settings: ISettings,
): number {
    const containsNestedLayout = layoutItems.some((layoutItem) => isDashboardLayout(layoutItem.widget));
    if (containsNestedLayout) {
        return MAXIMUM_HEIGHT_OF_ROW_WITH_NESTED_WIDGETS;
    }

    const maxHeights: number[] = layoutItems
        .filter((layoutItem) => isDashboardWidget(layoutItem))
        .map((layoutItem: IDashboardLayoutItem<ExtendedDashboardWidget>) => {
            const widget = layoutItem.widget!;
            if (isVisualizationSwitcherWidget(widget) && widget.visualizations.length > 0) {
                return Math.min(
                    ...getVisSwitcherDimension(
                        widget,
                        insightMap,
                        getDashboardLayoutWidgetMaxGridHeight,
                        settings,
                    ),
                );
            }
            if (isDashboardLayout(widget)) {
                return getContainerHeight(layoutItem, screen, settings);
            }
            return getDashboardLayoutWidgetMaxGridHeight(
                settings,
                getExtendedWidgetType(widget),
                getWidgetContent(widget, insightMap),
            );
        });
    return Math.min(...maxHeights);
}

/**
 * @internal
 */
export function getDashboardLayoutWidgetMinGridWidth(
    settings: ISettings,
    widgetType: AnalyticalWidgetType | ExtendedDashboardWidget["type"],
    widgetContent?: MeasurableWidgetContent, // undefined for placeholders
): number {
    const sizeInfo = getSizeInfo(settings, widgetType, widgetContent);
    return sizeInfo.width.min!;
}

type DashboardLayoutWidgetGridDimension = (
    settings: ISettings,
    widgetType: AnalyticalWidgetType,
    widgetContent?: MeasurableWidgetContent,
) => number;

function getVisSwitcherDimension(
    widget: IVisualizationSwitcherWidget,
    insightMap: ObjRefMap<IInsight>,
    getDashboardLayoutWidgetGridDimension: DashboardLayoutWidgetGridDimension,
    settings: ISettings,
): number[] {
    return widget.visualizations.map((visualization) => {
        return getDashboardLayoutWidgetGridDimension(
            settings,
            getWidgetType(widget),
            insightMap.get(visualization.insight),
        );
    });
}

/**
 * Calculates width for a single item based on the container direction
 */
function calculateItemWidth(
    item: IDashboardLayoutItem<ExtendedDashboardWidget>,
    direction: IDashboardLayoutContainerDirection,
    screen: ScreenSize,
    settings: ISettings,
    insightMap: ObjRefMap<IInsight>,
    emptyLayoutMinWidth: number,
): number {
    const widget = item.widget!;

    if (isDashboardLayout(widget)) {
        const itemDirection = getLayoutConfiguration(widget).direction;
        const layoutMinWidth = getDashboardLayoutWidgetMinGridWidth(settings, widget.type);

        return calculateRecursiveLayoutWidth(
            widget,
            itemDirection,
            screen,
            insightMap,
            settings,
            layoutMinWidth,
        );
    }

    return direction === "row"
        ? (determineWidthForScreen(screen, item.size) ?? emptyLayoutMinWidth)
        : getDashboardLayoutWidgetMinGridWidth(
              settings,
              getExtendedWidgetType(widget),
              getWidgetContent(widget, insightMap),
          );
}

/**
 * Calculates the maximum width of items in a container recursively based on direction
 */
function calculateRecursiveLayoutWidth(
    container: IDashboardLayout<ExtendedDashboardWidget>,
    direction: IDashboardLayoutContainerDirection,
    screen: ScreenSize,
    insightMap: ObjRefMap<IInsight>,
    settings: ISettings,
    emptyLayoutMinWidth: number,
): number {
    const items = container.sections.flatMap((section) => section.items).filter((item) => item.widget);

    if (items.length === 0) {
        return emptyLayoutMinWidth;
    }

    return items
        .map((item) => {
            const itemDirection = isDashboardLayout(item.widget)
                ? getLayoutConfiguration(item.widget).direction
                : direction;
            return calculateItemWidth(item, itemDirection, screen, settings, insightMap, emptyLayoutMinWidth);
        })
        .reduce((maxWidth, itemWidth) => Math.max(maxWidth, itemWidth), emptyLayoutMinWidth);
}

/**
 * @internal
 */
export function getMinWidth(
    widget: ExtendedDashboardWidget,
    insightMap: ObjRefMap<IInsight>,
    screen: ScreenSize,
    settings: ISettings,
    direction: IDashboardLayoutContainerDirection,
): number {
    if (isCustomWidget(widget)) {
        return MIN_VISUALIZATION_WIDTH;
    }
    if (isVisualizationSwitcherWidget(widget) && widget.visualizations.length > 0) {
        return Math.max(
            ...getVisSwitcherDimension(widget, insightMap, getDashboardLayoutWidgetMinGridWidth, settings),
        );
    }

    if (isDashboardLayout(widget)) {
        const emptyLayoutMinWidth = getDashboardLayoutWidgetMinGridWidth(settings, widget.type);
        return calculateRecursiveLayoutWidth(
            widget,
            direction,
            screen,
            insightMap,
            settings,
            emptyLayoutMinWidth,
        );
    }
    return getDashboardLayoutWidgetMinGridWidth(
        settings,
        getExtendedWidgetType(widget),
        getWidgetContent(widget, insightMap),
    );
}

export function normalizeItemSizeToParent(
    itemToCheck: IDashboardLayoutItem<ExtendedDashboardWidget>,
    itemPath: ILayoutItemPath | undefined,
    layout: IDashboardLayout<ExtendedDashboardWidget>,
    settings: ISettings,
    insightsMap: ObjRefMap<IInsight>,
    screen: ScreenSize = "xl",
): {
    item: IDashboardLayoutItem<ExtendedDashboardWidget>;
    sizeChanged: boolean;
} {
    if (itemPath && hasParent(itemPath) && itemToCheck.widget) {
        const widget = itemToCheck.widget;
        const parent = findItem(layout, itemPath.slice(0, -1));
        const { direction } = getLayoutConfiguration(
            parent.widget as IDashboardLayout<ExtendedDashboardWidget>,
        );
        const minWidth = getMinWidth(widget, insightsMap, screen, settings, direction);
        const newSize = normalizeSizeToParent(itemToCheck.size, minWidth, parent, direction, screen);
        const sizeChanged = newSize.xl.gridWidth !== itemToCheck.size.xl.gridWidth;
        const item = {
            ...itemToCheck,
            size: newSize,
        };
        return {
            item,
            sizeChanged,
        };
    }
    return { item: itemToCheck, sizeChanged: false };
}

const getNormalizedParentWidth = (
    parentDirection: IDashboardLayoutContainerDirection,
    widthForScreen: number,
    parentWidth: number,
    itemMinWidth: number,
): number => {
    if (widthForScreen > parentWidth) {
        return Math.max(parentWidth, itemMinWidth); // do not overflow parent width
    }
    return parentDirection === "column"
        ? parentWidth // auto size widget to the parent width when the target is a column container
        : widthForScreen; // use widget width when the target is a row container
};

function normalizeSizeToParent(
    itemSize: IDashboardLayoutSizeByScreenSize,
    itemMinWidth: number,
    parent: IDashboardLayoutItem<ExtendedDashboardWidget>,
    parentDirection: IDashboardLayoutContainerDirection,
    screen: ScreenSize = "xl",
): IDashboardLayoutSizeByScreenSize {
    const width = determineWidthForScreen(screen, itemSize);
    const parentWidth = determineWidthForScreen(screen, parent.size);
    return {
        xl: {
            gridHeight: itemSize.xl.gridHeight, // keep height untouched as the container can be extended freely in this direction
            gridWidth: getNormalizedParentWidth(parentDirection, width, parentWidth, itemMinWidth),
        },
    };
}

/**
 * @internal
 */
export function calculateWidgetMinHeight(
    layoutItem: IDashboardLayoutItem<ExtendedDashboardWidget>,
    currentSize: IDashboardLayoutSize | undefined,
    insightMap: ObjRefMap<IInsight>,
    settings: ISettings,
    isExportMode?: boolean,
): number | undefined {
    let widgetType: AnalyticalWidgetType;
    let content: IInsight | IKpi;
    const widget = layoutItem.widget;

    if (isExportMode) {
        return undefined;
    }

    if (isWidget(widget)) {
        widgetType = getWidgetType(widget);
    }
    if (isInsightWidget(widget)) {
        content = insightMap.get(widget.insight)!;
    }
    if (isKpiWidget(widget)) {
        content = widget.kpi;
    }
    if (!currentSize || currentSize.heightAsRatio) {
        return undefined;
    }
    return (
        getDashboardLayoutItemHeight(currentSize) ||
        getDashboardLayoutWidgetDefaultHeight(settings, widgetType!, content!)
    );
}

export const getDashboardLayoutItemHeight = (size: IDashboardLayoutSize): number | undefined => {
    const { gridHeight } = size;
    if (gridHeight) {
        return getDashboardLayoutItemHeightForGrid(gridHeight);
    }

    return undefined;
};

export const getDashboardLayoutItemHeightForGrid = (gridHeight: number): number =>
    gridHeight * GRID_ROW_HEIGHT_IN_PX;

export const determineSizeForScreen = (
    screen: ScreenSize,
    layoutItemSize?: IDashboardLayoutSizeByScreenSize,
): IDashboardLayoutSize => {
    return {
        ...(layoutItemSize ? (layoutItemSize[screen] ?? {}) : {}),
        gridWidth: determineWidthForScreen(screen, layoutItemSize),
    };
};

export const determineWidthForScreen = (
    screen: ScreenSize,
    layoutItemSize?: IDashboardLayoutSizeByScreenSize,
) => {
    // Determine if element has size set in metadata object for the current screen size
    const providedSizeForScreen = layoutItemSize?.[screen];
    // Use the provided size for the screen if it is known, otherwise determine the size for the current
    // screen if we at least know xl size from metadata object, otherwise expect the element to be root
    // element with that spans the full size.
    const itemSize =
        providedSizeForScreen ??
        implicitLayoutItemSizeFromXlSize(
            layoutItemSize?.xl ?? {
                gridWidth: DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
            },
        )[screen];
    // Expect element to be full size if we could not get the size for the current screen from the value above.
    return itemSize?.gridWidth ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
};

/**
 * Derive dashboard layout size for all screens from dashboard layout size defined for xl screen.
 * We have only xl size saved in metadata, this will create additional screen sizes based on xl.
 *
 * @param xlSize - dashboard layout size for xl screen
 */
export function implicitLayoutItemSizeFromXlSize(
    xlSize: IDashboardLayoutSize,
): IDashboardLayoutSizeByScreenSize {
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
 * @param parentLayoutSize - the size of parent layout, undefined if the items are in the root layout
 * @param screen - responsive screen class
 */
export function splitDashboardLayoutItemsAsRenderedGridRows<TWidget>(
    items: IDashboardLayoutItem<TWidget>[],
    parentLayoutSize: IDashboardLayoutSizeByScreenSize | undefined,
    screen: ScreenSize,
): IDashboardLayoutItem<TWidget>[][] {
    const parentLayoutColumnWidth =
        parentLayoutSize?.[screen]?.gridWidth ?? DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
    const renderedRows: IDashboardLayoutItem<TWidget>[][] = [];

    let currentRowWidth = 0;
    let currentRow: IDashboardLayoutItem<TWidget>[] = [];

    items.forEach((item) => {
        const itemSize = determineSizeForScreen(screen, item.size);

        if (itemSize === null || itemSize === undefined) {
            throw Error("Item size for current screen is undefined");
        }

        if (currentRowWidth + itemSize.gridWidth > parentLayoutColumnWidth) {
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
