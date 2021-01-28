// (C) 2019-2021 GoodData Corporation
import flatten from "lodash/flatten";
import round from "lodash/round";
import isNil from "lodash/isNil";
import isEqual from "lodash/isEqual";
import {
    IFluidLayoutSizeByScreen,
    isFluidLayout,
    IFluidLayoutSize,
    FluidLayoutFacade,
    ResponsiveScreenType,
    isWidget,
    isWidgetDefinition,
} from "@gooddata/sdk-backend-spi";
import { ALL_SCREENS } from "../../FluidLayout";
import {
    IDashboardViewLayoutColumn,
    IDashboardViewLayout,
    IDashboardViewLayoutRow,
} from "../interfaces/dashboardLayout";
import { DashboardViewLayoutWidgetClass } from "../interfaces/dashboardLayoutSizing";
import {
    DASHBOARD_LAYOUT_CONTAINER_WIDTHS,
    DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT,
    DASHBOARD_LAYOUT_MAX_HEIGHT_AS_RATIO_XS,
    WIDGET_DIMENSIONS_DEFAULT,
    WIDGET_DIMENSIONS_TABLE,
} from "../constants";

/**
 * Unify fluid layout columns height for all screens.
 *
 * @param columns - fluid layout columns
 */
export function unifyDashboardLayoutColumnHeights<TCustomContent>(
    layout: IDashboardViewLayout<TCustomContent>,
): IDashboardViewLayout<TCustomContent>;
export function unifyDashboardLayoutColumnHeights<TCustomContent>(
    columns: IDashboardViewLayoutColumn<TCustomContent>[],
): IDashboardViewLayoutColumn<TCustomContent>[];
export function unifyDashboardLayoutColumnHeights<TCustomContent>(
    columnsOrLayout: IDashboardViewLayout<TCustomContent> | IDashboardViewLayoutColumn<TCustomContent>[],
): IDashboardViewLayout<TCustomContent> | IDashboardViewLayoutColumn<TCustomContent>[] {
    if (isFluidLayout(columnsOrLayout)) {
        const updatedLayout: IDashboardViewLayout<TCustomContent> = {
            ...columnsOrLayout,
            rows: FluidLayoutFacade.for(columnsOrLayout)
                .rows()
                .reduce((acc: IDashboardViewLayoutRow<TCustomContent>[], row) => {
                    return [
                        ...acc,
                        {
                            ...row.raw(),
                            columns: unifyDashboardLayoutColumnHeights(row.columns().raw()),
                        },
                    ];
                }, []),
        };

        return updatedLayout;
    }

    const columnsWithSizeForAllScreens = columnsOrLayout.map((column) => ({
        ...column,
        size: dashboardLayoutColumnSizeForAllScreensFromXLSize(column.size.xl),
    }));

    const columnsWithUnifiedHeightForAllScreens: IDashboardViewLayoutColumn<
        TCustomContent
    >[] = ALL_SCREENS.reduce((acc, screen) => {
        const fluidLayoutColumnsAsFutureGridRows = splitDashboardLayoutColumnsAsFutureGridRows(acc, screen);

        const fluidLayoutColumnsWithUnifiedHeight = flatten(
            fluidLayoutColumnsAsFutureGridRows.map((futureGridRow) =>
                unifyDashboardLayoutColumnHeightsForScreen(futureGridRow, screen),
            ),
        );

        return fluidLayoutColumnsWithUnifiedHeight;
    }, columnsWithSizeForAllScreens);

    return columnsWithUnifiedHeightForAllScreens;
}

/**
 * Derive fluid layout size for all screens from fluid layout size defined for xl screen.
 *
 * @param xlSize - fluid layout size for xl screen
 */
function dashboardLayoutColumnSizeForAllScreensFromXLSize(
    xlSize: IFluidLayoutSize,
): IFluidLayoutSizeByScreen {
    const xlWidth: number = xlSize.widthAsGridColumnsCount;
    const ratio: number = xlSize.heightAsRatio;

    switch (xlWidth) {
        case 0:
            return dashboardLayoutColumnSizeForAllScreens(0, 0, 0, 0, 0, 0);
        case 1:
            return dashboardLayoutColumnSizeForAllScreens(ratio, xlWidth, xlWidth, 2, 6, 12);
        case 2:
            return dashboardLayoutColumnSizeForAllScreens(ratio, xlWidth, xlWidth, 4, 6, 12);
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
            return dashboardLayoutColumnSizeForAllScreens(ratio, xlWidth, xlWidth, 6, 12, 12);
        case 10:
            return dashboardLayoutColumnSizeForAllScreens(ratio, xlWidth, xlWidth, 12, 12, 12);
        case 11:
            return dashboardLayoutColumnSizeForAllScreens(ratio, xlWidth, xlWidth, 12, 12, 12);
        case 12:
            return dashboardLayoutColumnSizeForAllScreens(ratio, xlWidth, xlWidth, 12, 12, 12);
    }
}

/**
 * Create fluid layout column size for all screens,
 * with identical height, defined as ratio,
 * but different width, defined as grid columns count.
 *
 * @param heightAsRatio - height as ratio to the width, defined in percents
 * @param xl - width as grid columns count for xl screen
 * @param lg - width as grid columns count for lg screen
 * @param md - width as grid columns count for md screen
 * @param sm - width as grid columns count for sm screen
 * @param xs - width as grid columns count for xs screen
 */
function dashboardLayoutColumnSizeForAllScreens(
    heightAsRatio: number,
    xl: number,
    lg: number,
    md: number,
    sm: number,
    xs: number,
): IFluidLayoutSizeByScreen {
    return {
        xl: {
            widthAsGridColumnsCount: xl,
            heightAsRatio,
        },
        lg: {
            widthAsGridColumnsCount: lg,
            heightAsRatio,
        },
        md: {
            widthAsGridColumnsCount: md,
            heightAsRatio,
        },
        sm: {
            widthAsGridColumnsCount: sm,
            heightAsRatio,
        },
        xs: {
            widthAsGridColumnsCount: xs,
            heightAsRatio,
        },
    };
}

/**
 * Divide the columns into a list representing the future rows of the grid.
 * This is useful for performing column transformations, depending on how they really appear in the grid.
 *
 * @param columns - fluild layout columns
 * @param screen - responsive screen class
 */
function splitDashboardLayoutColumnsAsFutureGridRows<TCustomContent>(
    columns: IDashboardViewLayoutColumn<TCustomContent>[],
    screen: ResponsiveScreenType,
): IDashboardViewLayoutColumn<TCustomContent>[][] {
    const virtualRows: IDashboardViewLayoutColumn<TCustomContent>[][] = [];

    let currentRowWidth = 0;
    let currentRow: IDashboardViewLayoutColumn<TCustomContent>[] = [];

    columns.forEach((column) => {
        const columnSize: IFluidLayoutSize = column.size[screen];

        if (isNil(columnSize)) {
            throw Error("Column size for current screen is undefined");
        }

        if (currentRowWidth + columnSize.widthAsGridColumnsCount > DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT) {
            virtualRows.push(currentRow);
            currentRow = [];
            currentRowWidth = 0;
        }

        currentRow.push(column);
        currentRowWidth = currentRowWidth + columnSize.widthAsGridColumnsCount;
    });

    if (currentRow.length > 0) {
        virtualRows.push(currentRow);
    }

    return virtualRows;
}

/**
 * Calculate fluid layout column height for the provided screen.
 * Result is width of the column, defined as grid columns count,
 * multiplied by height, defined as a ratio.
 *
 * @param column - fluid layout column
 * @param screen -  responsive screen class
 */
function dashboardLayoutColumnHeightForScreen<TCustomContent>(
    column: IDashboardViewLayoutColumn<TCustomContent>,
    screen: ResponsiveScreenType,
) {
    const { widthAsGridColumnsCount, heightAsRatio = 0 } = column.size?.[screen] ?? {};
    if (!widthAsGridColumnsCount) {
        return 0;
    }
    return widthAsGridColumnsCount * heightAsRatio;
}

/**
 * Unify fluid layout columns height, defined as ratio, for the provided screen.
 * It overrides height of all columns to the highest column height found for the provided screen.
 *
 * @param columns - fluid layout columns
 * @param screen -  responsive screen class
 */
function unifyDashboardLayoutColumnHeightsForScreen<TCustomContent>(
    columns: IDashboardViewLayoutColumn<TCustomContent>[],
    screen: ResponsiveScreenType,
): IDashboardViewLayoutColumn<TCustomContent>[] {
    const heights = columns.map((column) => dashboardLayoutColumnHeightForScreen(column, screen));
    const maxHeight = Math.max(0, ...heights);

    if (maxHeight === 0) {
        return columns;
    }

    return columns.map((column) => updateDashboardLayoutColumnHeight(column, screen, maxHeight));
}

const updateDashboardLayoutColumnHeight = <TCustomContent>(
    column: IDashboardViewLayoutColumn<TCustomContent>,
    screen: ResponsiveScreenType,
    maxHeight: number,
): IDashboardViewLayoutColumn<TCustomContent> => {
    const columnSizeForCurrentScreen = column.size[screen];
    const heightAsRatio = columnSizeForCurrentScreen?.widthAsGridColumnsCount
        ? round(maxHeight / columnSizeForCurrentScreen.widthAsGridColumnsCount, 2)
        : 0;

    let updatedColumn = column;

    if (
        !isNil(columnSizeForCurrentScreen?.heightAsRatio) &&
        columnSizeForCurrentScreen?.heightAsRatio !== heightAsRatio
    ) {
        if (isWidget(updatedColumn.content) || isWidgetDefinition(updatedColumn.content)) {
            updatedColumn = {
                ...updatedColumn,
                content: {
                    ...updatedColumn.content,
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
                [screen]: {
                    ...updatedColumn.size[screen],
                    heightAsRatio: DASHBOARD_LAYOUT_MAX_HEIGHT_AS_RATIO_XS,
                },
            },
        };
    }

    return updatedColumn;
};

export function getDashboardLayoutMinimumWidgetHeight(type: DashboardViewLayoutWidgetClass): number {
    let dimension = WIDGET_DIMENSIONS_TABLE[type];

    if (!dimension) {
        dimension = WIDGET_DIMENSIONS_DEFAULT;
    }

    return dimension.defHeightPx;
}

export const getDashboardLayoutContentHeightForRatioAndScreen = (
    size: IFluidLayoutSize,
    screen: ResponsiveScreenType,
): number => {
    const { widthAsGridColumnsCount, heightAsRatio } = size;
    // TODO: RAIL-2869  Migrate to ResponsiveContext
    const actualWidth = DASHBOARD_LAYOUT_CONTAINER_WIDTHS[screen];
    const actualColumnUnitWidth = actualWidth / DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;
    return actualColumnUnitWidth * widthAsGridColumnsCount * (heightAsRatio / 100);
};

/**
 * Tuple that represents a column position in the layout
 * [rowIndex, columnIndex]
 *
 * @internal
 */
type ColumnPosition = [number, number];

export const getResizedColumnPositions = <TCustomContent>(
    originalLayout: IDashboardViewLayout<TCustomContent>,
    resizedLayout: IDashboardViewLayout<TCustomContent>,
    positions: ColumnPosition[] = [],
): ColumnPosition[] => {
    const originalLayoutFacade = FluidLayoutFacade.for(originalLayout);
    return FluidLayoutFacade.for(resizedLayout)
        .rows()
        .reduce((acc: ColumnPosition[], row) => {
            return row.columns().reduce((acc, column) => {
                const originalColumn = originalLayoutFacade
                    .rows()
                    .row(row.index())
                    .columns()
                    .column(column.index());
                const originalContent = originalColumn.content();
                const updatedContent = column.content();

                // Is nested layout?
                if (isFluidLayout(originalContent) && isFluidLayout(updatedContent)) {
                    return getResizedColumnPositions(originalContent, updatedContent, positions);
                }

                if (
                    !isEqual(originalColumn.size(), column.size()) &&
                    (isWidget(updatedContent) || isWidgetDefinition(updatedContent))
                ) {
                    acc.push([column.row().index(), column.index()]);
                }

                return acc;
            }, acc);
        }, positions);
};
