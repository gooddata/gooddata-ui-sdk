// (C) 2007-2026 GoodData Corporation

import { cloneDeep, isEmpty, without } from "lodash-es";
import { invariant } from "ts-invariant";

import { type IDataView } from "@gooddata/sdk-backend-spi";
import { type IMeasureDescriptor, type IMeasureGroupDescriptor, type ITheme } from "@gooddata/sdk-model";
import {
    BucketNames,
    DataViewFacade,
    type IHeaderPredicate,
    VisualizationTypes,
    getMappingHeaderFormattedName,
} from "@gooddata/sdk-ui";
import { type IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { assignYAxes, getXAxes, getYAxes } from "./chartAxes.js";
import {
    multiMeasuresAlternatingTypes,
    showingNameInLegendWhenViewByPresent,
    unsupportedStackingTypes,
} from "./chartCapabilities.js";
import { setupDistinctPointShapesToSeries } from "./chartDistinctPointShapes.js";
import { getDrillableSeries } from "./chartDrilling.js";
import { assignForecastAxes } from "./chartForecast.js";
import { assignOutliersAxes } from "./chartOutliers.js";
import { getSeries } from "./chartSeries.js";
import {
    filterThresholdZonesCategories,
    setupComboThresholdZones,
    setupThresholdZones,
} from "./chartThresholds.js";
import {
    buildTooltipFactory,
    generateTooltipHeatmapFn,
    generateTooltipSankeyChartFn,
    generateTooltipScatterPlotFn,
    generateTooltipXYFn,
    getTooltipFactory,
    getTooltipWaterfallChart,
} from "./chartTooltips.js";
import { ColorFactory } from "./colorFactory.js";
import { setMeasuresToSecondaryAxis } from "./dualAxis.js";
import { getCategoriesForTwoAttributes } from "./extendedStackingChartOptions.js";
import { type IChartConfig, ViewByAttributesLimit } from "../../../interfaces/index.js";
import {
    PARENT_ATTRIBUTE_INDEX,
    PRIMARY_ATTRIBUTE_INDEX,
    STACK_BY_DIMENSION_INDEX,
    VIEW_BY_DIMENSION_INDEX,
} from "../../constants/dimensions.js";
import { type StackingType } from "../../constants/stacking.js";
import { type ColorAxisDataClassesOptions } from "../../lib/index.js";
import { type IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { type IChartOptions, type ISeriesItem, type ITooltipFactory } from "../../typings/unsafe.js";
import { getChartProperties } from "../_chartCreators/helpers.js";
import {
    isAreaChart,
    isBubbleChart,
    isChartSupported,
    isComboChart,
    isHeatmap,
    isOneOfTypes,
    isPyramid,
    isSankeyOrDependencyWheel,
    isScatterPlot,
    isTreemap,
    isWaterfall,
    stringifyChartTypes,
    unwrap,
} from "../_util/common.js";
import { findAttributeInDimension, findMeasureGroupInDimensions } from "../_util/executionResultHelper.js";
import {
    canComboChartBeStackedInPercent,
    getComboChartSeries,
    getComboChartStackingConfig,
} from "../comboChart/comboChartOptions.js";
import {
    buildWaterfallChartSeries,
    getColorAssignment,
    getWaterfallChartCategories,
} from "../waterfallChart/waterfallChartOptions.js";

const isAreaChartStackingEnabled = (options: IChartConfig) => {
    const { type, stacking, stackMeasures } = options;
    if (!isAreaChart(type)) {
        return false;
    }
    if (stackMeasures === undefined) {
        return stacking || stacking === undefined;
    }
    return stackMeasures;
};

function getCategories(
    type: string | undefined,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    emptyHeaderTitle: string,
): any[] {
    // We need an explicit any[] return type otherwise the code down the line no longer type checks, no time to fix all of it now
    if (isHeatmap(type)) {
        return [
            viewByAttribute
                ? viewByAttribute.items.map((item) =>
                      valueWithEmptyHandling(getMappingHeaderFormattedName(item), emptyHeaderTitle),
                  )
                : [""],
            stackByAttribute
                ? stackByAttribute.items.map((item) =>
                      valueWithEmptyHandling(getMappingHeaderFormattedName(item), emptyHeaderTitle),
                  )
                : [""],
        ];
    }
    if (isScatterPlot(type)) {
        return stackByAttribute
            ? stackByAttribute.items.map((item) =>
                  valueWithEmptyHandling(getMappingHeaderFormattedName(item), emptyHeaderTitle),
              )
            : [""];
    }

    // Categories make up bar/slice labels in charts. These usually match view by attribute values.
    // Measure only pie or treemap charts get categories from measure names
    if (viewByAttribute) {
        return viewByAttribute.items.map((item) =>
            valueWithEmptyHandling(getMappingHeaderFormattedName(item), emptyHeaderTitle),
        );
    }

    if (isOneOfTypes(type, multiMeasuresAlternatingTypes)) {
        // Pie or Treemap chart with measures only (no viewByAttribute) needs to list
        return measureGroup.items.map((wrappedMeasure) =>
            valueWithEmptyHandling(unwrap(wrappedMeasure).name, emptyHeaderTitle),
        );
        // Pie chart categories are later sorted by seriesItem pointValue
    }
    return [];
}

function getStackingConfig(
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    options: IChartConfig,
): StackingType {
    const { type, stackMeasures, stackMeasuresToPercent } = options;
    const stackingValue: StackingType = stackMeasuresToPercent ? "percent" : "normal";

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
export const DEFAULT_HEATMAP_COLOR_INDEX = 1;

export function getHeatmapDataClasses(
    series: ISeriesItem[] = [],
    colorStrategy: IColorStrategy,
): ColorAxisDataClassesOptions[] {
    const values: number[] = without(
        (series[0]?.data ?? []).map((item: any) => item.value),
        null,
        undefined,
        NaN,
    );

    if (isEmpty(values)) {
        return [];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const dataClasses = [];

    if (min === max) {
        dataClasses.push({
            from: min,
            to: max,
            color: colorStrategy.getColorByIndex(DEFAULT_HEATMAP_COLOR_INDEX),
        });
    } else {
        const step = (max - min) / HEAT_MAP_CATEGORIES_COUNT;
        let currentSum = min;
        for (let i = 0; i < HEAT_MAP_CATEGORIES_COUNT; i += 1) {
            dataClasses.push({
                from: currentSum,
                to: i === HEAT_MAP_CATEGORIES_COUNT - 1 ? max : currentSum + step,
                color: colorStrategy.getColorByIndex(i),
            });
            currentSum += step;
        }
    }

    return dataClasses;
}

export function getDefaultTreemapAttributes(dv: DataViewFacade): ChartedAttributes {
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

export function getTreemapAttributes(dv: DataViewFacade): ChartedAttributes {
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

export function getScatterPlotAttributes(dv: DataViewFacade): ChartedAttributes {
    const dimensions = dv.meta().dimensions();
    const attributeHeaderItems = dv.meta().attributeHeaders();

    const viewByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
    );

    const stackByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
        1,
    );

    return {
        viewByAttribute,
        stackByAttribute,
    };
}

type ChartedAttributes = {
    viewByAttribute?: IUnwrappedAttributeHeadersWithItems | null;
    viewByParentAttribute?: IUnwrappedAttributeHeadersWithItems | null;
    stackByAttribute?: IUnwrappedAttributeHeadersWithItems | null;
    isViewByTwoAttributes?: boolean;
};

function defaultChartedAttributeDiscovery(dv: DataViewFacade): ChartedAttributes {
    const attributeHeaderItems = dv.meta().attributeHeaders();
    const dimensions = dv.meta().dimensions();

    const isViewByTwoAttributes =
        attributeHeaderItems[VIEW_BY_DIMENSION_INDEX]?.length === ViewByAttributesLimit;

    let viewByParentAttribute: IUnwrappedAttributeHeadersWithItems | undefined;

    const viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined = findAttributeInDimension(
        dimensions[VIEW_BY_DIMENSION_INDEX],
        attributeHeaderItems[VIEW_BY_DIMENSION_INDEX],
        isViewByTwoAttributes ? PRIMARY_ATTRIBUTE_INDEX : undefined,
    );

    const stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
    );

    if (isViewByTwoAttributes) {
        viewByParentAttribute = findAttributeInDimension(
            dimensions[VIEW_BY_DIMENSION_INDEX],
            attributeHeaderItems[VIEW_BY_DIMENSION_INDEX],
            PARENT_ATTRIBUTE_INDEX,
        );
    }

    return {
        viewByAttribute,
        viewByParentAttribute,
        stackByAttribute,
        isViewByTwoAttributes,
    };
}

function chartedAttributeDiscovery(dv: DataViewFacade, chartType: string | undefined): ChartedAttributes {
    if (isTreemap(chartType)) {
        return getTreemapAttributes(dv);
    }

    if (isScatterPlot(chartType)) {
        return getScatterPlotAttributes(dv);
    }

    return defaultChartedAttributeDiscovery(dv);
}

function getLegendLabel(
    type: string | undefined,
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
) {
    let legendLabel;
    if (isTreemap(type)) {
        legendLabel = viewByAttribute?.formOf?.name;
    } else if (isOneOfTypes(type, showingNameInLegendWhenViewByPresent) && viewByAttribute) {
        legendLabel = viewByAttribute?.formOf?.name;
    } else {
        legendLabel = stackByAttribute?.formOf?.name;
    }

    return legendLabel;
}

function isAutoSortableChart(
    type: string | undefined,
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
) {
    const isPyramidWithViewByAttribute = isPyramid(type) && Boolean(viewByAttribute);
    return (
        isOneOfTypes(type, [VisualizationTypes.DONUT, VisualizationTypes.PIE, VisualizationTypes.FUNNEL]) ||
        isPyramidWithViewByAttribute
    );
}

export function getChartOptions(
    dataView: IDataView,
    chartConfig: IChartConfig,
    drillableItems: IHeaderPredicate[],
    emptyHeaderTitle: string,
    theme?: ITheme,
    totalColumnTitle?: string,
    clusterTitle?: string,
    anomaliesTitle?: string,
): IChartOptions {
    const dv = DataViewFacade.for(dataView);
    const dimensions = dv.meta().dimensions();
    const config = setMeasuresToSecondaryAxis(chartConfig, dv);

    invariant(
        config && isChartSupported(config.type),
        `config.type must be defined and match one of supported chart types: ${stringifyChartTypes()}, got: ${
            config.type
        }`,
    );

    const { type, chart } = config;
    const {
        viewByAttribute,
        viewByParentAttribute,
        stackByAttribute,
        isViewByTwoAttributes = false,
    } = chartedAttributeDiscovery(dv, type);

    // For bubble chart in single series mode (accessibility), use measure-based coloring like scatter plot
    const colorStrategyStackByAttribute =
        isBubbleChart(type) && chartConfig?.enableSingleBubbleSeries ? null : stackByAttribute;

    const colorStrategy = ColorFactory.getColorStrategy(
        config.colorPalette,
        config.colorMapping,
        viewByAttribute,
        viewByParentAttribute,
        colorStrategyStackByAttribute,
        dv,
        type,
        theme,
        clusterTitle,
    );

    const gridEnabled = config?.grid?.enabled ?? true;
    const stacking = getStackingConfig(stackByAttribute, config);
    const measureGroup = findMeasureGroupInDimensions(dimensions);
    const yAxes = getYAxes(dv, config, measureGroup, stackByAttribute);

    const seriesWithoutDrillability = getSeries(
        dv,
        measureGroup,
        viewByAttribute,
        viewByParentAttribute,
        stackByAttribute,
        type,
        colorStrategy,
        emptyHeaderTitle,
        theme,
        config.chartFill,
        config,
    );

    const drillableSeries = getDrillableSeries(
        dv,
        seriesWithoutDrillability,
        drillableItems,
        [viewByAttribute, viewByParentAttribute],
        stackByAttribute,
        type,
    );

    let initialSeries = assignYAxes(drillableSeries, yAxes);

    let categories = viewByParentAttribute
        ? getCategoriesForTwoAttributes(viewByAttribute, viewByParentAttribute, emptyHeaderTitle)
        : getCategories(type, measureGroup, viewByAttribute, stackByAttribute, emptyHeaderTitle);

    // When custom sorting is enabled and is chart which does the auto-sorting,
    // need to skip this, so the sort specified by the user does not get override.
    if (isAutoSortableChart(type, viewByAttribute) && !config.enableChartSorting && initialSeries[0]?.data) {
        // dataPoints are sorted by default by value in descending order
        const dataPoints = initialSeries[0].data;
        const indexSortOrder: number[] = [];
        const sortedDataPoints = dataPoints
            .sort((pointDataA, pointDataB) => {
                if (pointDataA.y === pointDataB.y) {
                    return 0;
                }
                return pointDataB.y! - pointDataA.y!;
            })
            .map((dataPoint, dataPointIndex: number) => {
                // Legend index equals original dataPoint index
                indexSortOrder.push(dataPoint.legendIndex!);
                return {
                    // after sorting, colors need to be reassigned in original order and legendIndex needs to be reset
                    ...dataPoint,
                    color: dataPoints[dataPointIndex]?.color,
                    legendIndex: dataPointIndex,
                };
            });
        // categories need to be sorted in exactly the same order as dataPoints
        categories = categories.map(
            (_category: any, dataPointIndex: number) => categories[indexSortOrder[dataPointIndex]],
        );
        initialSeries[0].data = sortedDataPoints;
    }

    // Forecast
    initialSeries = assignForecastAxes(type, initialSeries, dv.rawData().forecastTwoDimData());
    // Outliers
    initialSeries = assignOutliersAxes(
        config.colorPalette,
        config.anomalies,
        type,
        initialSeries,
        dv.rawData().outliersTwoDimData(),
        anomaliesTitle,
    );

    // Remove threshold metric series and define zones based upon its data
    const { series, plotLines } = setupThresholdZones(type, initialSeries, dv, config);

    categories = filterThresholdZonesCategories(type, categories, initialSeries, dv, config);

    const xAxes = getXAxes(dv, config, measureGroup, viewByAttribute, viewByParentAttribute, plotLines);

    const colorAssignments = colorStrategy.getColorAssignment();
    const { colorPalette } = config;
    const { xAxisProps, yAxisProps, secondary_xAxisProps, secondary_yAxisProps } = getChartProperties(
        config,
        type,
    );

    if (isComboChart(type)) {
        const comboInitialSeries = getComboChartSeries(config, measureGroup, initialSeries, dv);
        const { series: comboSeries, plotLines: comboPlotLines } = setupComboThresholdZones(
            type,
            comboInitialSeries,
            dv,
            config,
        );
        const xAxes = getXAxes(
            dv,
            config,
            measureGroup,
            viewByAttribute,
            viewByParentAttribute,
            comboPlotLines,
        );
        const canStackInPercent = canComboChartBeStackedInPercent(comboSeries);

        // apply distinct point shapes configuration to combo chart series
        const finalComboSeries = setupDistinctPointShapesToSeries(type, comboSeries, config, measureGroup);

        // apply colors on the series of the second chart (after some were possibly filtered out by thresholds)
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
                series: finalComboSeries,
                categories,
            },
            xAxisProps,
            yAxisProps,
            secondary_yAxisProps,
            colorAssignments,
            colorPalette,
            forceDisableDrillOnAxes: chartConfig.forceDisableDrillOnAxes,
            chartFill: config.chartFill,
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
                tooltip: generateTooltipScatterPlotFn(
                    measures,
                    stackByAttribute,
                    viewByAttribute,
                    config,
                    clusterTitle,
                ),
            },
            grid: {
                enabled: gridEnabled,
            },
            xAxisProps,
            yAxisProps,
            colorAssignments,
            colorPalette,
            forceDisableDrillOnAxes: chartConfig.forceDisableDrillOnAxes,
            chartFill: config.chartFill,
        };
    }

    if (isHeatmap(type)) {
        const { xAxisProps, yAxisProps } = getChartProperties(config, type);
        return {
            type,
            stacking: null,
            legendLayout: "horizontal",
            legendLabel: unwrap(measureGroup?.items[0])?.name,
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
                tooltip: generateTooltipHeatmapFn(
                    viewByAttribute,
                    stackByAttribute,
                    emptyHeaderTitle,
                    config,
                ),
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
        const measures: (IMeasureDescriptor | null)[] = [];
        const measureGroupCopy = cloneDeep(measureGroup);
        const { xAxisProps, yAxisProps } = getChartProperties(config, type);

        if (dv.def().isBucketEmpty(BucketNames.MEASURES)) {
            measures.push(null);
        } else {
            measures.push(measureGroup.items[0] ? measureGroupCopy.items.shift()! : null);
        }

        if (dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES)) {
            measures.push(null);
        } else {
            measures.push(measureGroup.items[0] ? measureGroupCopy.items.shift()! : null);
        }

        if (dv.def().isBucketEmpty(BucketNames.TERTIARY_MEASURES)) {
            measures.push(null);
        } else {
            measures.push(measureGroup.items[0] ? measureGroupCopy.items.shift()! : null);
        }

        return {
            type,
            stacking,
            hasViewByAttribute: Boolean(stackByAttribute),
            legendLayout: "horizontal",
            legendLabel: getLegendLabel(type, viewByAttribute, stackByAttribute),
            yAxes,
            xAxes,
            data: {
                series,
                categories: [[""]],
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
            chartFill: config.chartFill,
        };
    }

    if (isSankeyOrDependencyWheel(type)) {
        return {
            type,
            data: {
                series,
                categories: [[""]],
            },
            actions: {
                tooltip: generateTooltipSankeyChartFn(
                    viewByAttribute,
                    viewByParentAttribute,
                    measureGroup.items[0],
                    config,
                ),
            },
            colorPalette,
            colorAssignments,
            chartFill: chartConfig.chartFill,
        };
    }

    if (isWaterfall(type)) {
        const waterfallChartSeries = buildWaterfallChartSeries(
            measureGroup,
            series,
            chartConfig,
            colorAssignments[0],
            colorPalette!,
            totalColumnTitle!,
            config.chartFill,
            theme,
        );
        const waterfallCategories = getWaterfallChartCategories(
            categories,
            chartConfig,
            measureGroup,
            totalColumnTitle!,
        );
        return {
            type,
            stacking,
            hasStackByAttribute: Boolean(stackByAttribute),
            hasViewByAttribute: Boolean(viewByAttribute),
            legendLayout: config.legendLayout || "horizontal",
            legendLabel: getLegendLabel(type, viewByAttribute, stackByAttribute),
            xAxes,
            yAxes,
            data: {
                series: waterfallChartSeries,
                categories: waterfallCategories,
            },
            actions: {
                tooltip: getTooltipWaterfallChart(viewByAttribute, chartConfig),
            },
            grid: {
                enabled: gridEnabled,
            },
            xAxisProps,
            yAxisProps,
            colorAssignments: getColorAssignment(colorAssignments, chartConfig, waterfallChartSeries),
            colorPalette,
            isViewByTwoAttributes,
            forceDisableDrillOnAxes: chartConfig.forceDisableDrillOnAxes,
            verticalAlign: chart?.verticalAlign,
            chartFill: chartConfig.chartFill,
        };
    }

    const isDualAxis = yAxes.length === 2;
    let measure: IMeasureDescriptor | undefined;

    /**
     * Because of the problem described in TNT-16, we decided to change the visual of the tooltip.
     * If the visualization contains stack by attribute, it is possible to have just one measure.
     * Therefore the first measure from measureGroup is used.
     */
    if (!dv.def().isBucketEmpty(BucketNames.MEASURES)) {
        measure = {
            ...measureGroup.items[0],
        };
    }

    const tooltipFactory: ITooltipFactory = getTooltipFactory(
        isViewByTwoAttributes,
        viewByAttribute,
        viewByParentAttribute,
        stackByAttribute,
        measure,
        emptyHeaderTitle,
        config,
        isDualAxis,
    );

    // apply distinct point shapes configuration if enabled
    const finalSeries = setupDistinctPointShapesToSeries(type, series, config, measureGroup);

    return {
        type,
        stacking,
        hasStackByAttribute: Boolean(stackByAttribute),
        hasViewByAttribute: Boolean(viewByAttribute),
        legendLayout: config.legendLayout || "horizontal",
        legendLabel: getLegendLabel(type, viewByAttribute, stackByAttribute),
        xAxes,
        yAxes,
        data: {
            series: finalSeries,
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
        verticalAlign: chart?.verticalAlign,
        chartFill: chartConfig.chartFill,
    };
}
