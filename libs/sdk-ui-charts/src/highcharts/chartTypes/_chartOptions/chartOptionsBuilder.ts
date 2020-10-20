// (C) 2007-2020 GoodData Corporation
import { IDataView, IMeasureDescriptor, IMeasureGroupDescriptor } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";

import { BucketNames, DataViewFacade, IHeaderPredicate } from "@gooddata/sdk-ui";
import { IChartConfig, ViewByAttributesLimit } from "../../../interfaces";
import {
    PARENT_ATTRIBUTE_INDEX,
    PRIMARY_ATTRIBUTE_INDEX,
    STACK_BY_DIMENSION_INDEX,
    VIEW_BY_DIMENSION_INDEX,
} from "../../constants/dimensions";

import { findAttributeInDimension, findMeasureGroupInDimensions } from "../_util/executionResultHelper";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess";

import { IColorStrategy } from "@gooddata/sdk-ui-vis-commons";

import {
    isAreaChart,
    isBubbleChart,
    isChartSupported,
    isComboChart,
    isHeatmap,
    isOneOfTypes,
    isScatterPlot,
    isTreemap,
    stringifyChartTypes,
    unwrap,
} from "../_util/common";
import { setMeasuresToSecondaryAxis } from "./dualAxis";
import {
    canComboChartBeStackedInPercent,
    getComboChartSeries,
    getComboChartStackingConfig,
} from "../comboChart/comboChartOptions";

import { getCategoriesForTwoAttributes } from "./extendedStackingChartOptions";

import { ColorFactory } from "./colorFactory";
import { getChartProperties } from "../_chartCreators/helpers";
import Highcharts from "../../adapter/highcharts";
import {
    multiMeasuresAlternatingTypes,
    sortedByMeasureTypes,
    unsupportedStackingTypes,
} from "./chartCapabilities";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import isUndefined from "lodash/isUndefined";
import without from "lodash/without";
import { NORMAL_STACK, PERCENT_STACK } from "../../constants/stacking";
import { IChartOptions, IPointData } from "../../typings/unsafe";
import { getSeries } from "./chartSeries";
import {
    buildTooltipFactory,
    generateTooltipHeatmapFn,
    generateTooltipXYFn,
    getTooltipFactory,
    ITooltipFactory,
} from "./chartTooltips";
import { getDrillableSeries } from "./chartDrilling";
import { assignYAxes, getXAxes, getYAxes } from "./chartAxes";

const isAreaChartStackingEnabled = (options: IChartConfig) => {
    const { type, stacking, stackMeasures } = options;
    if (!isAreaChart(type)) {
        return false;
    }
    if (isUndefined(stackMeasures)) {
        return stacking || isUndefined(stacking);
    }
    return stackMeasures;
};

function getCategories(
    type: string,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
) {
    if (isHeatmap(type)) {
        return [
            viewByAttribute ? viewByAttribute.items.map((item: any) => item.attributeHeaderItem.name) : [""],
            stackByAttribute
                ? stackByAttribute.items.map((item: any) => item.attributeHeaderItem.name)
                : [""],
        ];
    }
    if (isScatterPlot(type)) {
        return stackByAttribute
            ? stackByAttribute.items.map((item: any) => item.attributeHeaderItem.name)
            : [""];
    }

    // Categories make up bar/slice labels in charts. These usually match view by attribute values.
    // Measure only pie or treemap charts get categories from measure names
    if (viewByAttribute) {
        return viewByAttribute.items.map(({ attributeHeaderItem }: any) => attributeHeaderItem.name);
    }

    if (isOneOfTypes(type, multiMeasuresAlternatingTypes)) {
        // Pie or Treemap chart with measures only (no viewByAttribute) needs to list
        return measureGroup.items.map((wrappedMeasure: IMeasureDescriptor) => unwrap(wrappedMeasure).name);
        // Pie chart categories are later sorted by seriesItem pointValue
    }
    return [];
}

function getStackingConfig(
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    options: IChartConfig,
): string {
    const { type, stackMeasures, stackMeasuresToPercent } = options;
    const stackingValue = stackMeasuresToPercent ? PERCENT_STACK : NORMAL_STACK;

    const supportsStacking = !isOneOfTypes(type, unsupportedStackingTypes);

    /**
     * we should enable stacking for one of the following cases :
     * 1) If stackby attribute have been set and chart supports stacking
     * 2) If chart is an area chart and stacking is enabled (stackBy attribute doesn't matter)
     * 3) If chart is column/bar chart and 'Stack Measures' is enabled
     */
    const isStackByChart = stackByAttribute && supportsStacking;
    const isAreaChartWithEnabledStacking = isAreaChartStackingEnabled(options);

    if (isStackByChart || isAreaChartWithEnabledStacking || stackMeasures || stackMeasuresToPercent) {
        return stackingValue;
    }
    return null; // no stacking
}

export const HEAT_MAP_CATEGORIES_COUNT = 7;
export const HIGHCHARTS_PRECISION = 15;
export const DEFAULT_HEATMAP_COLOR_INDEX = 1;

export function getHeatmapDataClasses(
    series: any = [],
    colorStrategy: IColorStrategy,
): Highcharts.ColorAxisDataClassesOptions[] {
    const values: number[] = without(
        get(series, "0.data", []).map((item: any) => item.value),
        null,
        undefined,
        NaN,
    );

    if (isEmpty(values)) {
        return [];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const safeMin = parseFloat(Number(min).toPrecision(HIGHCHARTS_PRECISION));
    const safeMax = parseFloat(Number(max).toPrecision(HIGHCHARTS_PRECISION));
    const dataClasses = [];

    if (min === max) {
        dataClasses.push({
            from: min,
            to: max,
            color: colorStrategy.getColorByIndex(DEFAULT_HEATMAP_COLOR_INDEX),
        });
    } else {
        const step = (safeMax - safeMin) / HEAT_MAP_CATEGORIES_COUNT;
        let currentSum = safeMin;
        for (let i = 0; i < HEAT_MAP_CATEGORIES_COUNT; i += 1) {
            dataClasses.push({
                from: currentSum,
                to: i === HEAT_MAP_CATEGORIES_COUNT - 1 ? safeMax : currentSum + step,
                color: colorStrategy.getColorByIndex(i),
            });
            currentSum += step;
        }
    }

    return dataClasses;
}

export function getDefaultTreemapAttributes(dv: DataViewFacade): any {
    const dimensions = dv.meta().dimensions();
    const attributeHeaderItems = dv.meta().attributeHeaders();

    let viewByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
    );
    const stackByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
        1,
    );
    if (!viewByAttribute) {
        viewByAttribute = findAttributeInDimension(
            dimensions[VIEW_BY_DIMENSION_INDEX],
            attributeHeaderItems[VIEW_BY_DIMENSION_INDEX],
        );
    }
    return {
        viewByAttribute,
        stackByAttribute,
    };
}

export function getTreemapAttributes(dv: DataViewFacade): any {
    if (!dv.def().hasBuckets()) {
        // without mdObject cant distinguish 1M 1Vb 0Sb and 1M 0Vb 1Sb
        return getDefaultTreemapAttributes(dv);
    }

    const dimensions = dv.meta().dimensions();
    const attributeHeaderItems = dv.meta().attributeHeaders();

    if (dv.def().isBucketEmpty(BucketNames.SEGMENT)) {
        if (dv.def().isBucketEmpty(BucketNames.VIEW)) {
            return {
                viewByAttribute: null,
                stackByAttribute: null,
            };
        }
        return {
            viewByAttribute: findAttributeInDimension(
                dimensions[VIEW_BY_DIMENSION_INDEX],
                attributeHeaderItems[VIEW_BY_DIMENSION_INDEX],
            ),
            stackByAttribute: null,
        };
    }
    if (dv.def().isBucketEmpty(BucketNames.VIEW)) {
        return {
            viewByAttribute: null,
            stackByAttribute: findAttributeInDimension(
                dimensions[VIEW_BY_DIMENSION_INDEX],
                attributeHeaderItems[VIEW_BY_DIMENSION_INDEX],
            ),
        };
    }
    return {
        viewByAttribute: findAttributeInDimension(
            dimensions[STACK_BY_DIMENSION_INDEX],
            attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
        ),
        stackByAttribute: findAttributeInDimension(
            dimensions[STACK_BY_DIMENSION_INDEX],
            attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
            1,
        ),
    };
}

export function getChartOptions(
    dataView: IDataView,
    chartConfig: IChartConfig,
    drillableItems: IHeaderPredicate[],
): IChartOptions {
    const dv = DataViewFacade.for(dataView);

    const dimensions = dv.meta().dimensions();
    const attributeHeaderItems = dv.meta().attributeHeaders();

    const config = setMeasuresToSecondaryAxis(chartConfig, dv);

    invariant(
        config && isChartSupported(config.type),
        `config.type must be defined and match one of supported chart types: ${stringifyChartTypes()}, got: ${
            config.type
        }`,
    );

    const { type } = config;

    const isViewByTwoAttributes =
        attributeHeaderItems[VIEW_BY_DIMENSION_INDEX] &&
        attributeHeaderItems[VIEW_BY_DIMENSION_INDEX].length === ViewByAttributesLimit;
    let viewByAttribute: IUnwrappedAttributeHeadersWithItems;
    let viewByParentAttribute: IUnwrappedAttributeHeadersWithItems;
    let stackByAttribute: IUnwrappedAttributeHeadersWithItems;

    if (isTreemap(type)) {
        const {
            viewByAttribute: treemapViewByAttribute,
            stackByAttribute: treemapStackByAttribute,
        } = getTreemapAttributes(dv);
        viewByAttribute = treemapViewByAttribute;
        stackByAttribute = treemapStackByAttribute;
    } else {
        viewByAttribute = findAttributeInDimension(
            dimensions[VIEW_BY_DIMENSION_INDEX],
            attributeHeaderItems[VIEW_BY_DIMENSION_INDEX],
            isViewByTwoAttributes ? PRIMARY_ATTRIBUTE_INDEX : undefined,
        );
        stackByAttribute = findAttributeInDimension(
            dimensions[STACK_BY_DIMENSION_INDEX],
            attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
        );
    }

    if (isViewByTwoAttributes) {
        viewByParentAttribute = findAttributeInDimension(
            dimensions[VIEW_BY_DIMENSION_INDEX],
            attributeHeaderItems[VIEW_BY_DIMENSION_INDEX],
            PARENT_ATTRIBUTE_INDEX,
        );
    }

    const colorStrategy = ColorFactory.getColorStrategy(
        config.colorPalette,
        config.colorMapping,
        viewByAttribute,
        stackByAttribute,
        dv,
        type,
    );

    const gridEnabled = get(config, "grid.enabled", true);
    const stacking = getStackingConfig(stackByAttribute, config);
    const measureGroup = findMeasureGroupInDimensions(dimensions);
    const xAxes = getXAxes(dv, config, measureGroup, viewByAttribute);
    const yAxes = getYAxes(dv, config, measureGroup, stackByAttribute);

    const seriesWithoutDrillability = getSeries(
        dv,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        type,
        colorStrategy,
    );

    const drillableSeries = getDrillableSeries(
        dv,
        seriesWithoutDrillability,
        drillableItems,
        [viewByAttribute, viewByParentAttribute],
        stackByAttribute,
        type,
    );

    const series = assignYAxes(drillableSeries, yAxes);

    let categories = viewByParentAttribute
        ? getCategoriesForTwoAttributes(viewByAttribute, viewByParentAttribute)
        : getCategories(type, measureGroup, viewByAttribute, stackByAttribute);

    // Pie charts dataPoints are sorted by default by value in descending order
    if (isOneOfTypes(type, sortedByMeasureTypes)) {
        const dataPoints = series[0].data;
        const indexSortOrder: number[] = [];
        const sortedDataPoints = dataPoints
            .sort((pointDataA: IPointData, pointDataB: IPointData) => {
                if (pointDataA.y === pointDataB.y) {
                    return 0;
                }
                return pointDataB.y - pointDataA.y;
            })
            .map((dataPoint: IPointData, dataPointIndex: number) => {
                // Legend index equals original dataPoint index
                indexSortOrder.push(dataPoint.legendIndex);
                return {
                    // after sorting, colors need to be reassigned in original order and legendIndex needs to be reset
                    ...dataPoint,
                    color: get(dataPoints[dataPointIndex], "color"),
                    legendIndex: dataPointIndex,
                };
            });
        // categories need to be sorted in exactly the same order as dataPoints
        categories = categories.map(
            (_category: any, dataPointIndex: number) => categories[indexSortOrder[dataPointIndex]],
        );
        series[0].data = sortedDataPoints;
    }

    const colorAssignments = colorStrategy.getColorAssignment();
    const { colorPalette } = config;
    const { xAxisProps, yAxisProps, secondary_xAxisProps, secondary_yAxisProps } = getChartProperties(
        config,
        type,
    );

    if (isComboChart(type)) {
        const comboSeries = getComboChartSeries(config, measureGroup, series, dv);
        const canStackInPercent = canComboChartBeStackedInPercent(comboSeries);
        return {
            type,
            xAxes,
            yAxes,
            stacking: getComboChartStackingConfig(config, comboSeries, stacking),
            legendLayout: config.legendLayout || "horizontal",
            actions: {
                tooltip: buildTooltipFactory(viewByAttribute, type, {
                    ...config,
                    stackMeasuresToPercent: config.stackMeasuresToPercent && canStackInPercent,
                }),
            },
            grid: {
                enabled: gridEnabled,
            },
            data: {
                series: comboSeries,
                categories,
            },
            xAxisProps,
            yAxisProps,
            secondary_yAxisProps,
            colorAssignments,
            colorPalette,
            forceDisableDrillOnAxes: chartConfig.forceDisableDrillOnAxes,
        };
    }

    if (isScatterPlot(type)) {
        const { xAxisProps, yAxisProps } = getChartProperties(config, type);

        let measures = [
            measureGroup.items[0] ? measureGroup.items[0] : null,
            measureGroup.items[1] ? measureGroup.items[1] : null,
        ];
        if (dv.def().isBucketEmpty(BucketNames.MEASURES)) {
            measures = [null, measureGroup.items[0] ? measureGroup.items[0] : null];
        }

        return {
            type,
            stacking,
            legendLayout: "horizontal",
            yAxes,
            xAxes,
            data: {
                series,
                categories,
            },
            actions: {
                tooltip: generateTooltipXYFn(measures, stackByAttribute, config),
            },
            grid: {
                enabled: gridEnabled,
            },
            xAxisProps,
            yAxisProps,
            colorAssignments,
            colorPalette,
            forceDisableDrillOnAxes: chartConfig.forceDisableDrillOnAxes,
        };
    }

    if (isHeatmap(type)) {
        const { xAxisProps, yAxisProps } = getChartProperties(config, type);
        return {
            type,
            stacking: null,
            legendLayout: "horizontal",
            title: {
                x: viewByAttribute ? viewByAttribute.name : "",
                y: stackByAttribute ? stackByAttribute.name : "",
                format: unwrap(measureGroup.items[0]).format,
            },
            xAxes,
            yAxes,
            data: {
                series,
                categories,
            },
            actions: {
                tooltip: generateTooltipHeatmapFn(viewByAttribute, stackByAttribute, config),
            },
            grid: {
                enabled: false,
            },
            colorAxis: {
                dataClasses: getHeatmapDataClasses(series, colorStrategy),
            },
            xAxisProps,
            yAxisProps,
            colorAssignments,
            colorPalette,
            forceDisableDrillOnAxes: chartConfig.forceDisableDrillOnAxes,
        };
    }

    if (isBubbleChart(type)) {
        const measures: IMeasureDescriptor[] = [];
        const measureGroupCopy = cloneDeep(measureGroup);
        const { xAxisProps, yAxisProps } = getChartProperties(config, type);

        if (!dv.def().isBucketEmpty(BucketNames.MEASURES)) {
            measures.push(measureGroup.items[0] ? measureGroupCopy.items.shift() : null);
        } else {
            measures.push(null);
        }

        if (!dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES)) {
            measures.push(measureGroup.items[0] ? measureGroupCopy.items.shift() : null);
        } else {
            measures.push(null);
        }

        if (!dv.def().isBucketEmpty(BucketNames.TERTIARY_MEASURES)) {
            measures.push(measureGroup.items[0] ? measureGroupCopy.items.shift() : null);
        } else {
            measures.push(null);
        }

        return {
            type,
            stacking,
            hasViewByAttribute: Boolean(stackByAttribute),
            legendLayout: "horizontal",
            yAxes,
            xAxes,
            data: {
                series,
                categories: [""],
            },
            actions: {
                tooltip: generateTooltipXYFn(measures, stackByAttribute, config),
            },
            grid: {
                enabled: gridEnabled,
            },
            xAxisProps,
            yAxisProps,
            colorAssignments,
            colorPalette,
            forceDisableDrillOnAxes: chartConfig.forceDisableDrillOnAxes,
        };
    }

    const isDualAxis = yAxes.length === 2;

    const tooltipFactory: ITooltipFactory = getTooltipFactory(
        isViewByTwoAttributes,
        viewByAttribute,
        viewByParentAttribute,
        stackByAttribute,
        config,
        isDualAxis,
    );

    const chartOptions = {
        type,
        stacking,
        hasStackByAttribute: Boolean(stackByAttribute),
        hasViewByAttribute: Boolean(viewByAttribute),
        legendLayout: config.legendLayout || "horizontal",
        xAxes,
        yAxes,
        data: {
            series,
            categories,
        },
        actions: {
            tooltip: tooltipFactory,
        },
        grid: {
            enabled: gridEnabled,
        },
        xAxisProps,
        yAxisProps,
        secondary_xAxisProps,
        secondary_yAxisProps,
        colorAssignments,
        colorPalette,
        isViewByTwoAttributes,
        forceDisableDrillOnAxes: chartConfig.forceDisableDrillOnAxes,
    };

    return chartOptions;
}
