// (C) 2007-2020 GoodData Corporation
import { colors2Object, numberFormat } from "@gooddata/numberjs";
import {
    DataValue,
    IAttributeDescriptor,
    IDataView,
    IMeasureDescriptor,
    IMeasureGroupDescriptor,
    IResultAttributeHeader,
} from "@gooddata/sdk-backend-spi";
import cx from "classnames";
import invariant from "ts-invariant";

import {
    DataViewFacade,
    BucketNames,
    getDrillIntersection,
    IHeaderPredicate,
    IMappingHeader,
    isSomeHeaderPredicateMatched,
    VisType,
    VisualizationTypes,
} from "@gooddata/sdk-ui";
import { IChartConfig, IChartLimits, ViewByAttributesLimit } from "../../interfaces";
import {
    PARENT_ATTRIBUTE_INDEX,
    PRIMARY_ATTRIBUTE_INDEX,
    STACK_BY_DIMENSION_INDEX,
    VIEW_BY_DIMENSION_INDEX,
} from "../constants/dimensions";
import { HEATMAP_DATA_POINTS_LIMIT, PIE_CHART_LIMIT } from "../constants/limits";

import { findAttributeInDimension, findMeasureGroupInDimensions } from "../utils/executionResultHelper";
import { IUnwrappedAttributeHeadersWithItems } from "../utils/types";

import { IColorStrategy, getLighterColor } from "@gooddata/sdk-ui-vis-commons";

import {
    customEscape,
    isAreaChart,
    isBarChart,
    isBubbleChart,
    isChartSupported,
    isComboChart,
    isCssMultiLineTruncationSupported,
    isHeatmap,
    isOneOfTypes,
    isScatterPlot,
    isTreemap,
    parseValue,
    stringifyChartTypes,
    unwrap,
    isBulletChart,
} from "../utils/common";
import { setMeasuresToSecondaryAxis } from "../utils/dualAxis";
import {
    canComboChartBeStackedInPercent,
    getComboChartSeries,
    getComboChartStackingConfig,
} from "./chartOptions/comboChartOptions";

import { getCategoriesForTwoAttributes } from "./chartOptions/extendedStackingChartOptions";

import { ColorFactory } from "./colorFactory";

import {
    DEFAULT_CATEGORIES_LIMIT,
    DEFAULT_DATA_POINTS_LIMIT,
    DEFAULT_SERIES_LIMIT,
} from "./highcharts/commonConfiguration";
import { getChartProperties } from "./highcharts/helpers";
import Highcharts from "./highcharts/highchartsEntryPoint";
import { isDataOfReasonableSize } from "./highChartsCreators";
import { formatValueForTooltip, getFormattedValueForTooltip } from "./tooltip";
import { supportedDualAxesChartTypes } from "./chartCapabilities";
import cloneDeep from "lodash/cloneDeep";
import compact from "lodash/compact";
import get from "lodash/get";
import includes from "lodash/includes";
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
import isUndefined from "lodash/isUndefined";
import last from "lodash/last";
import range from "lodash/range";
import without from "lodash/without";
import omit from "lodash/omit";
import { NORMAL_STACK, PERCENT_STACK } from "../constants/stacking";
import {
    IAxis,
    ICategory,
    IChartOptions,
    IPatternObject,
    IPointData,
    ISeriesDataItem,
    ISeriesItem,
    ISeriesItemConfig,
} from "../typings/unsafe";
import { getBulletChartSeries } from "./chartOptions/bulletChartOptions";
import { GRAY, WHITE, TRANSPARENT } from "../utils/color";

const TOOLTIP_PADDING = 10;

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

// types with only many measures or one measure and one attribute
const multiMeasuresAlternatingTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.TREEMAP,
];

const unsupportedNegativeValuesTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.TREEMAP,
];

// charts sorted by default by measure value
const sortedByMeasureTypes = [VisualizationTypes.PIE, VisualizationTypes.DONUT, VisualizationTypes.FUNNEL];

const unsupportedStackingTypes = [
    VisualizationTypes.LINE,
    VisualizationTypes.AREA,
    VisualizationTypes.SCATTER,
    VisualizationTypes.BUBBLE,
];

const nullColor: IPatternObject = {
    pattern: {
        path: {
            d: "M 10 0 L 0 10 M 9 11 L 11 9 M 4 11 L 11 4 M -1 1 L 1 -1 M -1 6 L 6 -1",
            stroke: GRAY,
            strokeWidth: 1,
            fill: WHITE,
        },
        width: 10,
        height: 10,
    },
};

export interface IValidationResult {
    dataTooLarge: boolean;
    hasNegativeValue: boolean;
}

export type ITooltipFactory = (
    point: IPointData,
    maxTooltipContentWidth: number,
    percentageValue?: number,
) => string;

export function isNegativeValueIncluded(series: ISeriesItem[]): boolean {
    return series.some((seriesItem: ISeriesItem) =>
        (seriesItem.data || []).some(({ y, value }: ISeriesDataItem) => y < 0 || value < 0),
    );
}

function getChartLimits(type: string): IChartLimits {
    switch (type) {
        case VisualizationTypes.SCATTER:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_SERIES_LIMIT,
            };
        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.FUNNEL:
            return {
                series: 1,
                categories: PIE_CHART_LIMIT,
            };
        case VisualizationTypes.TREEMAP:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_DATA_POINTS_LIMIT,
                dataPoints: DEFAULT_DATA_POINTS_LIMIT,
            };
        case VisualizationTypes.HEATMAP:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_CATEGORIES_LIMIT,
                dataPoints: HEATMAP_DATA_POINTS_LIMIT,
            };
        default:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_CATEGORIES_LIMIT,
            };
    }
}

export function cannotShowNegativeValues(type: string): boolean {
    return isOneOfTypes(type, unsupportedNegativeValuesTypes);
}

function getTreemapDataForValidation(data: any) {
    // filter out root nodes
    return {
        ...data,
        series: data.series.map((serie: any) => ({
            ...serie,
            data: serie.data.filter((dataItem: any) => dataItem.id === undefined),
        })),
    };
}

export function validateData(limits: IChartLimits, chartOptions: IChartOptions): IValidationResult {
    const { type, isViewByTwoAttributes } = chartOptions;
    const finalLimits = limits || getChartLimits(type);
    let dataToValidate = chartOptions.data;
    if (isTreemap(type)) {
        dataToValidate = getTreemapDataForValidation(chartOptions.data);
    }

    return {
        dataTooLarge: !isDataOfReasonableSize(dataToValidate, finalLimits, isViewByTwoAttributes),
        hasNegativeValue: cannotShowNegativeValues(type) && isNegativeValueIncluded(chartOptions.data.series),
    };
}

export function getSeriesItemData(
    seriesItem: string[],
    seriesIndex: number,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: string,
    colorStrategy: IColorStrategy,
): IPointData[] {
    return seriesItem.map((pointValue: string, pointIndex: number) => {
        // by default seriesIndex corresponds to measureGroup label index
        let measureIndex = seriesIndex;
        // by default pointIndex corresponds to viewBy label index
        let viewByIndex = pointIndex;
        // drillContext can have 1 to 3 items
        // viewBy attribute label, stackby label if available
        // last drillContextItem is always current serie measure
        if (stackByAttribute) {
            // pointIndex corresponds to viewBy attribute label (if available)
            viewByIndex = pointIndex;
            // stack bar chart has always just one measure
            measureIndex = 0;
        } else if (isOneOfTypes(type, multiMeasuresAlternatingTypes) && !viewByAttribute) {
            measureIndex = pointIndex;
        }

        let valueProp: any = {
            y: parseValue(pointValue),
        };
        if (isTreemap(type)) {
            valueProp = {
                value: parseValue(pointValue),
            };
        }

        const pointData: IPointData = Object.assign(
            {
                ...valueProp,
                format: unwrap(measureGroup.items[measureIndex]).format,
            },
            pointValue === null
                ? {
                      marker: {
                          enabled: false,
                      },
                  }
                : {},
        );

        if (stackByAttribute) {
            // if there is a stackBy attribute, then seriesIndex corresponds to stackBy label index
            pointData.name = unwrap(stackByAttribute.items[seriesIndex]).name;
        } else if (isOneOfTypes(type, multiMeasuresAlternatingTypes) && viewByAttribute) {
            pointData.name = unwrap(viewByAttribute.items[viewByIndex]).name;
        } else {
            pointData.name = unwrap(measureGroup.items[measureIndex]).name;
        }

        if (isOneOfTypes(type, multiMeasuresAlternatingTypes)) {
            pointData.color = colorStrategy.getColorByIndex(pointIndex);
            // Pie and Treemap charts use pointData viewByIndex as legendIndex if available
            // instead of seriesItem legendIndex
            pointData.legendIndex = viewByAttribute ? viewByIndex : pointIndex;
        }

        return pointData;
    });
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getHeatmapSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
) {
    const data: IPointData[] = [];
    dv.rawData()
        .twoDimData()
        .forEach((rowItem: DataValue[], rowItemIndex: number) => {
            rowItem.forEach((columnItem: DataValue, columnItemIndex: number) => {
                const value: number = parseValue(String(columnItem));
                const pointData: IPointData = { x: columnItemIndex, y: rowItemIndex, value };
                if (isNil(value)) {
                    data.push({
                        ...pointData,
                        borderWidth: 1,
                        borderColor: GRAY,
                        color: TRANSPARENT,
                    });
                    data.push({
                        ...pointData,
                        borderWidth: 0,
                        pointPadding: 2,
                        color: nullColor,
                        // ignoredInDrillEventContext flag is used internally, not related to Highchart
                        // to check and remove this null-value point in drill message
                        ignoredInDrillEventContext: true,
                    });
                } else {
                    data.push(pointData);
                }
            });
        });

    return [
        {
            name: measureGroup.items[0].measureHeaderItem.name,
            data,
            turboThreshold: 0,
            yAxis: 0,
            dataLabels: {
                formatGD: unwrap(measureGroup.items[0]).format,
            },
            legendIndex: 0,
        },
    ];
}

export function getScatterPlotSeries(
    dv: DataViewFacade,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    stackByAttribute: any,
    colorStrategy: IColorStrategy,
): any[] {
    const primaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.MEASURES);
    const secondaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);

    const data: ISeriesDataItem[] = dv
        .rawData()
        .twoDimData()
        .map((seriesItem: string[], seriesIndex: number) => {
            const values = seriesItem.map((value: string) => {
                return parseValue(value);
            });

            return {
                x: !primaryMeasuresBucketEmpty ? values[0] : 0,
                y: !secondaryMeasuresBucketEmpty ? (primaryMeasuresBucketEmpty ? values[0] : values[1]) : 0,
                name: stackByAttribute ? stackByAttribute.items[seriesIndex].attributeHeaderItem.name : "",
            };
        });

    return [
        {
            turboThreshold: 0,
            color: colorStrategy.getColorByIndex(0),
            legendIndex: 0,
            data,
        },
    ];
}

function getCountOfEmptyBuckets(bucketEmptyFlags: boolean[] = []) {
    return bucketEmptyFlags.filter((bucketEmpyFlag) => bucketEmpyFlag).length;
}

export function getBubbleChartSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    stackByAttribute: any,
    colorStrategy: IColorStrategy,
): any[] {
    const primaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.MEASURES);
    const secondaryMeasuresBucketEmpty = dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);

    return dv
        .rawData()
        .twoDimData()
        .map((resData: any, index: number) => {
            let data: any = [];
            if (resData[0] !== null && resData[1] !== null && resData[2] !== null) {
                const emptyBucketsCount = getCountOfEmptyBuckets([
                    primaryMeasuresBucketEmpty,
                    secondaryMeasuresBucketEmpty,
                ]);
                data = [
                    {
                        x: !primaryMeasuresBucketEmpty ? parseValue(resData[0]) : 0,
                        y: !secondaryMeasuresBucketEmpty ? parseValue(resData[1 - emptyBucketsCount]) : 0,
                        // we want to allow NaN on z to be able show bubble of default size when Size bucket is empty
                        z: parseFloat(resData[2 - emptyBucketsCount]),
                        format: unwrap(last(measureGroup.items)).format, // only for dataLabel format
                    },
                ];
            }
            return {
                name: stackByAttribute ? stackByAttribute.items[index].attributeHeaderItem.name : "",
                color: colorStrategy.getColorByIndex(index),
                legendIndex: index,
                data,
            };
        });
}

function getColorStep(valuesCount: number): number {
    const MAX_COLOR_BRIGHTNESS = 0.8;
    return MAX_COLOR_BRIGHTNESS / valuesCount;
}

function gradientPreviousGroup(solidColorLeafs: any[]): any[] {
    const colorChange = getColorStep(solidColorLeafs.length);
    return solidColorLeafs.map((leaf: any, index: number) => ({
        ...leaf,
        color: getLighterColor(leaf.color, colorChange * index),
    }));
}

function getRootPoint(rootName: string, index: number, format: string, colorStrategy: IColorStrategy) {
    return {
        id: `${index}`,
        name: rootName,
        color: colorStrategy.getColorByIndex(index),
        showInLegend: true,
        legendIndex: index,
        format,
    };
}

function getLeafPoint(
    stackByAttribute: any,
    parentIndex: number,
    seriesIndex: number,
    data: any,
    format: string,
    colorStrategy: IColorStrategy,
) {
    return {
        name: stackByAttribute.items[seriesIndex].attributeHeaderItem.name,
        parent: `${parentIndex}`,
        value: parseValue(data),
        x: seriesIndex,
        y: seriesIndex,
        showInLegend: false,
        color: colorStrategy.getColorByIndex(parentIndex),
        format,
    };
}

function isLastSerie(seriesIndex: number, dataLength: number) {
    return seriesIndex === dataLength - 1;
}

export function getTreemapStackedSeriesDataWithViewBy(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    colorStrategy: IColorStrategy,
): any[] {
    const roots: any = [];
    const leafs: any = [];
    let rootId = -1;
    let uncoloredLeafs: any = [];
    let lastRoot: IResultAttributeHeader["attributeHeaderItem"] = null;

    const executionResultData = dv.rawData().twoDimData();
    const dataLength = executionResultData.length;
    const format = unwrap(measureGroup.items[0]).format; // this configuration has only one measure

    executionResultData.forEach((seriesItems: string[], seriesIndex: number) => {
        const currentRoot = viewByAttribute.items[seriesIndex].attributeHeaderItem;

        if (!isEqual(currentRoot, lastRoot)) {
            // store previous group leafs
            leafs.push(...gradientPreviousGroup(uncoloredLeafs));
            rootId++;
            lastRoot = currentRoot;
            uncoloredLeafs = [];
            // create parent for pasted leafs
            const lastRootName: string = get(lastRoot, "name");
            roots.push(getRootPoint(lastRootName, rootId, format, colorStrategy));
        }
        // create leafs which will be colored at the end of group
        uncoloredLeafs.push(
            getLeafPoint(stackByAttribute, rootId, seriesIndex, seriesItems[0], format, colorStrategy),
        );

        if (isLastSerie(seriesIndex, dataLength)) {
            // store last group leafs
            leafs.push(...gradientPreviousGroup(uncoloredLeafs));
        }
    });

    return [...roots, ...leafs]; // roots need to be first items in data to keep legend working
}

export function getTreemapStackedSeriesDataWithMeasures(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    stackByAttribute: any,
    colorStrategy: IColorStrategy,
): any[] {
    let data: any = [];

    measureGroup.items.reduce((data: any[], measureGroupItem: any, index: number) => {
        data.push({
            id: `${index}`,
            name: measureGroupItem.measureHeaderItem.name,
            format: measureGroupItem.measureHeaderItem.format,
            color: colorStrategy.getColorByIndex(index),
            showInLegend: true,
            legendIndex: index,
        });
        return data;
    }, data);

    dv.rawData()
        .twoDimData()
        .forEach((seriesItems: string[], seriesIndex: number) => {
            const colorChange = getColorStep(seriesItems.length);
            const unsortedLeafs: any[] = [];
            seriesItems.forEach((seriesItem: string, seriesItemIndex: number) => {
                unsortedLeafs.push({
                    name: stackByAttribute.items[seriesItemIndex].attributeHeaderItem.name,
                    parent: `${seriesIndex}`,
                    format: unwrap(measureGroup.items[seriesIndex]).format,
                    value: parseValue(seriesItem),
                    x: seriesIndex,
                    y: seriesItemIndex,
                    showInLegend: false,
                });
            });
            const sortedLeafs = unsortedLeafs.sort((a: IPointData, b: IPointData) => b.value - a.value);

            data = [
                ...data,
                ...sortedLeafs.map((leaf: IPointData, seriesItemIndex: number) => ({
                    ...leaf,
                    color: getLighterColor(
                        colorStrategy.getColorByIndex(seriesIndex),
                        colorChange * seriesItemIndex,
                    ),
                })),
            ];
        });

    return data;
}

export function getTreemapStackedSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    colorStrategy: IColorStrategy,
): any[] {
    let data = [];
    if (viewByAttribute) {
        data = getTreemapStackedSeriesDataWithViewBy(
            dv,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            colorStrategy,
        );
    } else {
        data = getTreemapStackedSeriesDataWithMeasures(dv, measureGroup, stackByAttribute, colorStrategy);
    }

    const seriesName = measureGroup.items
        .map((wrappedMeasure: IMeasureDescriptor) => {
            return unwrap(wrappedMeasure).name;
        })
        .join(", ");

    return [
        {
            name: seriesName,
            legendType: "point",
            showInLegend: true,
            data,
            turboThreshold: 0,
        },
    ];
}

export function getSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: string,
    colorStrategy: IColorStrategy,
): any {
    if (isHeatmap(type)) {
        return getHeatmapSeries(dv, measureGroup);
    } else if (isScatterPlot(type)) {
        return getScatterPlotSeries(dv, stackByAttribute, colorStrategy);
    } else if (isBubbleChart(type)) {
        return getBubbleChartSeries(dv, measureGroup, stackByAttribute, colorStrategy);
    } else if (isTreemap(type) && stackByAttribute) {
        return getTreemapStackedSeries(dv, measureGroup, viewByAttribute, stackByAttribute, colorStrategy);
    } else if (isBulletChart(type)) {
        return getBulletChartSeries(dv, measureGroup, colorStrategy);
    }

    return dv
        .rawData()
        .twoDimData()
        .map((seriesItem: string[], seriesIndex: number) => {
            const seriesItemData = getSeriesItemData(
                seriesItem,
                seriesIndex,
                measureGroup,
                viewByAttribute,
                stackByAttribute,
                type,
                colorStrategy,
            );

            const seriesItemConfig: ISeriesItemConfig = {
                color: colorStrategy.getColorByIndex(seriesIndex),
                legendIndex: seriesIndex,
                data: seriesItemData,
            };

            if (stackByAttribute) {
                // if stackBy attribute is available, seriesName is a stackBy attribute value of index seriesIndex
                // this is a limitiation of highcharts and a reason why you can not have multi-measure stacked charts
                seriesItemConfig.name = stackByAttribute.items[seriesIndex].attributeHeaderItem.name;
            } else if (isOneOfTypes(type, multiMeasuresAlternatingTypes) && !viewByAttribute) {
                // Pie charts with measures only have a single series which name would is ambiguous
                seriesItemConfig.name = measureGroup.items
                    .map((wrappedMeasure: IMeasureDescriptor) => {
                        return unwrap(wrappedMeasure).name;
                    })
                    .join(", ");
            } else {
                // otherwise seriesName is a measure name of index seriesIndex
                seriesItemConfig.name = measureGroup.items[seriesIndex].measureHeaderItem.name;
            }

            const turboThresholdProp = isTreemap(type) ? { turboThreshold: 0 } : {};

            return {
                ...seriesItemConfig,
                ...turboThresholdProp,
            };
        });
}

const renderTooltipHTML = (textData: string[][], maxTooltipContentWidth: number): string => {
    const maxItemWidth = maxTooltipContentWidth - TOOLTIP_PADDING * 2;
    const titleMaxWidth = maxItemWidth;
    const multiLineTruncationSupported = isCssMultiLineTruncationSupported();
    const threeDotsWidth = 16;
    const valueMaxWidth = multiLineTruncationSupported ? maxItemWidth : maxItemWidth - threeDotsWidth;
    const titleStyle = `style="max-width: ${titleMaxWidth}px;"`;
    const valueStyle = `style="max-width: ${valueMaxWidth}px;"`;
    const itemClass = cx("gd-viz-tooltip-item", {
        "multiline-supported": multiLineTruncationSupported,
    });
    const valueClass = cx("gd-viz-tooltip-value", {
        "clamp-two-line": multiLineTruncationSupported,
    });

    return textData
        .map((item: string[]) => {
            // the third span is hidden, that help to have tooltip work with max-width
            return `<div class="${itemClass}">
                        <span class="gd-viz-tooltip-title" ${titleStyle}>${item[0]}</span>
                        <div class="gd-viz-tooltip-value-wraper" ${titleStyle}>
                            <span class="${valueClass}" ${valueStyle}>${item[1]}</span>
                        </div>
                        <div class="gd-viz-tooltip-value-wraper" ${titleStyle}>
                            <span class="gd-viz-tooltip-value-max-content" ${valueStyle}>${item[1]}</span>
                        </div>
                    </div>`;
        })
        .join("\n");
};

function isPointOnOppositeAxis(point: IPointData): boolean {
    return get(point, ["series", "yAxis", "opposite"], false);
}

export function buildTooltipFactory(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: string,
    config: IChartConfig = {},
    isDualAxis: boolean = false,
): ITooltipFactory {
    const { separators, stackMeasuresToPercent = false } = config;

    return (point: IPointData, maxTooltipContentWidth: number, percentageValue?: number): string => {
        const isDualChartWithRightAxis = isDualAxis && isPointOnOppositeAxis(point);
        const formattedValue = getFormattedValueForTooltip(
            isDualChartWithRightAxis,
            stackMeasuresToPercent,
            point,
            separators,
            percentageValue,
        );

        const textData = [[customEscape(point.series.name), formattedValue]];

        if (viewByAttribute) {
            // For some reason, highcharts ommit categories for pie charts with attribute. Use point.name instead.
            // use attribute name instead of attribute display form name
            textData.unshift([
                customEscape(viewByAttribute.formOf.name),
                // since applying 'grouped-categories' plugin,
                // 'category' type is replaced from string to object in highchart
                customEscape((point.category && point.category.name) || point.name),
            ]);
        } else if (isOneOfTypes(type, multiMeasuresAlternatingTypes)) {
            // Pie charts with measure only have to use point.name instead of series.name to get the measure name
            textData[0][0] = customEscape(point.name);
        }
        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function buildTooltipForTwoAttributesFactory(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems,
    config: IChartConfig = {},
    isDualAxis: boolean = false,
): ITooltipFactory {
    const { separators, stackMeasuresToPercent = false } = config;

    return (point: IPointData, maxTooltipContentWidth: number, percentageValue?: number): string => {
        const category: ICategory = point.category;

        const isDualChartWithRightAxis = isDualAxis && isPointOnOppositeAxis(point);
        const formattedValue = getFormattedValueForTooltip(
            isDualChartWithRightAxis,
            stackMeasuresToPercent,
            point,
            separators,
            percentageValue,
        );

        const textData = [[customEscape(point.series.name), formattedValue]];

        if (category) {
            if (viewByAttribute) {
                textData.unshift([customEscape(viewByAttribute.formOf.name), customEscape(category.name)]);
            }

            if (viewByParentAttribute && category.parent) {
                textData.unshift([
                    customEscape(viewByParentAttribute.formOf.name),
                    customEscape(category.parent.name),
                ]);
            }
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function generateTooltipXYFn(
    measures: IMeasureDescriptor[],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    config: IChartConfig = {},
): ITooltipFactory {
    const { separators } = config;

    return (point: IPointData, maxTooltipContentWidth: number): string => {
        const textData = [];
        const name = point.name ? point.name : point.series.name;

        if (stackByAttribute) {
            textData.unshift([customEscape(stackByAttribute.formOf.name), customEscape(name)]);
        }

        if (measures[0]) {
            textData.push([
                customEscape(measures[0].measureHeaderItem.name),
                formatValueForTooltip(point.x, measures[0].measureHeaderItem.format, separators),
            ]);
        }

        if (measures[1]) {
            textData.push([
                customEscape(measures[1].measureHeaderItem.name),
                formatValueForTooltip(point.y, measures[1].measureHeaderItem.format, separators),
            ]);
        }

        if (measures[2]) {
            textData.push([
                customEscape(measures[2].measureHeaderItem.name),
                formatValueForTooltip(point.z, measures[2].measureHeaderItem.format, separators),
            ]);
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function generateTooltipHeatmapFn(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    viewByAttribute: any,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    stackByAttribute: any,
    config: IChartConfig = {},
): ITooltipFactory {
    const { separators } = config;
    const formatValue = (val: number, format: string) => {
        return colors2Object(val === null ? "-" : numberFormat(val, format, undefined, separators));
    };

    return (point: IPointData, maxTooltipContentWidth: number): string => {
        const formattedValue = customEscape(
            formatValue(point.value, point.series.userOptions.dataLabels.formatGD).label,
        );
        const textData = [];

        textData.unshift([customEscape(point.series.name), formattedValue]);

        if (viewByAttribute) {
            textData.unshift([
                customEscape(viewByAttribute.formOf.name),
                customEscape(viewByAttribute.items[point.x].attributeHeaderItem.name),
            ]);
        }
        if (stackByAttribute) {
            textData.unshift([
                customEscape(stackByAttribute.formOf.name),
                customEscape(stackByAttribute.items[point.y].attributeHeaderItem.name),
            ]);
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function buildTooltipTreemapFactory(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    config: IChartConfig = {},
): ITooltipFactory {
    const { separators } = config;

    return (point: IPointData, maxTooltipContentWidth: number) => {
        // show tooltip for leaf node only
        if (!point.node || point.node.isLeaf === false) {
            return null;
        }
        const formattedValue = formatValueForTooltip(point.value, point.format, separators);

        const textData = [];

        if (stackByAttribute) {
            textData.push([
                customEscape(stackByAttribute.formOf.name),
                customEscape(stackByAttribute.items[point.y].attributeHeaderItem.name),
            ]);
        }

        if (viewByAttribute) {
            textData.unshift([
                customEscape(viewByAttribute.formOf.name),
                customEscape(viewByAttribute.items[point.x].attributeHeaderItem.name),
            ]);
            textData.push([customEscape(point.series.name), formattedValue]);
        } else {
            textData.push([customEscape(point.category && point.category.name), formattedValue]);
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export interface ILegacyMeasureHeader {
    uri: string; // header attribute value or measure uri
    identifier?: string;
    localIdentifier: string;
    name: string; // header attribute value or measure text label
}

export interface ILegacyAttributeHeader extends ILegacyMeasureHeader {
    attribute: any;
}

export type ILegacyHeader = ILegacyAttributeHeader | ILegacyMeasureHeader;

export function isLegacyAttributeHeader(header: ILegacyHeader): header is ILegacyAttributeHeader {
    return (header as ILegacyAttributeHeader).attribute !== undefined;
}

function getViewBy(viewByAttribute: IUnwrappedAttributeHeadersWithItems, viewByIndex: number) {
    let viewByHeader: IResultAttributeHeader = null;
    let viewByItem = null;
    let viewByAttributeDescriptor: IAttributeDescriptor = null;

    if (viewByAttribute) {
        viewByHeader = viewByAttribute.items[viewByIndex];
        viewByItem = {
            ...unwrap(viewByHeader),
            attribute: viewByAttribute,
        };
        viewByAttributeDescriptor = { attributeHeader: omit(viewByAttribute, "items") };
    }

    return {
        viewByHeader,
        viewByItem,
        viewByAttributeDescriptor,
    };
}

function getStackBy(stackByAttribute: IUnwrappedAttributeHeadersWithItems, stackByIndex: number) {
    let stackByHeader: IResultAttributeHeader = null;
    let stackByItem = null;
    let stackByAttributeDescriptor: IAttributeDescriptor = null;

    if (stackByAttribute) {
        // stackBy item index is always equal to seriesIndex
        stackByHeader = stackByAttribute.items[stackByIndex];
        stackByItem = {
            ...unwrap(stackByHeader),
            attribute: stackByAttribute,
        };
        stackByAttributeDescriptor = { attributeHeader: omit(stackByAttribute, "items") };
    }

    return {
        stackByHeader,
        stackByItem,
        stackByAttributeDescriptor,
    };
}

export function getDrillableSeries(
    dv: DataViewFacade,
    series: any[],
    drillableItems: IHeaderPredicate[],
    viewByAttributes: IUnwrappedAttributeHeadersWithItems[],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: VisType,
): any {
    const [viewByChildAttribute, viewByParentAttribute] = viewByAttributes;

    const isMultiMeasureWithOnlyMeasures =
        isOneOfTypes(type, multiMeasuresAlternatingTypes) && !viewByChildAttribute;
    const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());

    return series.map((seriesItem, seriesIndex) => {
        let isSeriesDrillable = false;
        let data =
            seriesItem.data &&
            seriesItem.data.map((pointData: IPointData, pointIndex: number) => {
                let measureHeaders: IMappingHeader[] = [];

                const isStackedTreemap = isTreemap(type) && !!stackByAttribute;
                if (isScatterPlot(type)) {
                    measureHeaders = get(measureGroup, "items", []).slice(0, 2);
                } else if (isBubbleChart(type)) {
                    measureHeaders = get(measureGroup, "items", []).slice(0, 3);
                } else if (isStackedTreemap) {
                    if (pointData.id !== undefined) {
                        // not leaf -> can't be drillable
                        return pointData;
                    }
                    const measureIndex = viewByChildAttribute ? 0 : parseInt(pointData.parent, 10);
                    measureHeaders = [measureGroup.items[measureIndex]];
                } else {
                    // measureIndex is usually seriesIndex,
                    // except for stack by attribute and metricOnly pie or donut chart
                    // it is looped-around pointIndex instead
                    // Looping around the end of items array only works when
                    // measureGroup is the last header on it's dimension
                    // We do not support setups with measureGroup before attributeHeaders
                    const measureIndex =
                        !stackByAttribute && !isMultiMeasureWithOnlyMeasures
                            ? seriesIndex
                            : pointIndex % measureGroup.items.length;
                    measureHeaders = [measureGroup.items[measureIndex]];
                }

                const viewByIndex = isHeatmap(type) || isStackedTreemap ? pointData.x : pointIndex;
                let stackByIndex = isHeatmap(type) || isStackedTreemap ? pointData.y : seriesIndex;
                if (isScatterPlot(type)) {
                    stackByIndex = viewByIndex; // scatter plot uses stack by attribute but has only one serie
                }

                const { stackByHeader, stackByAttributeDescriptor } = getStackBy(
                    stackByAttribute,
                    stackByIndex,
                );

                const {
                    viewByHeader: viewByChildHeader,
                    viewByAttributeDescriptor: viewByChildAttributeDescriptor,
                } = getViewBy(viewByChildAttribute, viewByIndex);

                const {
                    viewByHeader: viewByParentHeader,
                    viewByAttributeDescriptor: viewByParentdAttributeDescriptor,
                } = getViewBy(viewByParentAttribute, viewByIndex);

                // point is drillable if a drillableItem matches:
                //   point's measure,
                //   point's viewBy attribute,
                //   point's viewBy attribute item,
                //   point's stackBy attribute,
                //   point's stackBy attribute item,
                const drillableHooks: IMappingHeader[] = without(
                    [
                        ...measureHeaders,
                        viewByChildAttributeDescriptor,
                        viewByChildHeader,
                        viewByParentdAttributeDescriptor,
                        viewByParentHeader,
                        stackByAttributeDescriptor,
                        stackByHeader,
                    ],
                    null,
                );

                const drilldown: boolean = drillableHooks.some((drillableHook) =>
                    isSomeHeaderPredicateMatched(drillableItems, drillableHook, dv),
                );

                const drillableProps: any = {
                    drilldown,
                };

                if (drilldown) {
                    const headers: IMappingHeader[] = [
                        ...measureHeaders,
                        viewByChildHeader,
                        viewByChildAttributeDescriptor,
                        viewByParentHeader,
                        viewByParentdAttributeDescriptor,
                        stackByHeader,
                        stackByAttributeDescriptor,
                    ];
                    const sanitizedHeaders = without([...headers], null);
                    drillableProps.drillIntersection = getDrillIntersection(sanitizedHeaders);
                    isSeriesDrillable = true;
                }
                return {
                    ...pointData,
                    ...drillableProps,
                };
            });

        if (isScatterPlot(type)) {
            data = data.filter((dataItem: ISeriesDataItem) => {
                return dataItem.x !== null && dataItem.y !== null;
            });
        }

        return {
            ...seriesItem,
            data,
            isDrillable: isSeriesDrillable,
        };
    });
}

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

function preprocessMeasureGroupItems(
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    defaultValues: any,
): any[] {
    return measureGroup.items.map((item: IMeasureDescriptor, index: number) => {
        const unwrapped = unwrap(item);
        return index
            ? {
                  label: unwrapped.name,
                  format: unwrapped.format,
              }
            : {
                  label: defaultValues.label || unwrapped.name,
                  format: defaultValues.format || unwrapped.format,
              };
    });
}

function getXAxes(
    dv: DataViewFacade,
    config: IChartConfig,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
): IAxis[] {
    const { type } = config;

    if (isScatterPlot(type) || isBubbleChart(type)) {
        const measureGroupItems = preprocessMeasureGroupItems(measureGroup, {
            label: config.xLabel,
            format: config.xFormat,
        });

        const firstMeasureGroupItem = measureGroupItems[0];

        const noPrimaryMeasures = dv.def().isBucketEmpty(BucketNames.MEASURES);
        if (noPrimaryMeasures) {
            return [
                {
                    label: "",
                },
            ];
        } else {
            return [
                {
                    label: firstMeasureGroupItem.label || "",
                    format: firstMeasureGroupItem.format || "",
                },
            ];
        }
    }

    const xLabel = config.xLabel || (viewByAttribute ? viewByAttribute.formOf.name : "");
    return [
        {
            label: xLabel,
        },
    ];
}

function getMeasureFormatKey(measureGroupItems: IMeasureDescriptor[]) {
    const percentageFormat = getMeasureFormat(
        measureGroupItems.find((measure: any) => {
            return isPercentage(getMeasureFormat(measure));
        }),
    );
    return percentageFormat !== ""
        ? {
              format: percentageFormat,
          }
        : {};
}

function getMeasureFormat(measure: any) {
    return get(measure, "format", "");
}

function isPercentage(format: string) {
    return format.includes("%");
}

function getYAxes(
    dv: DataViewFacade,
    config: IChartConfig,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    stackByAttribute: any,
): IAxis[] {
    const { type } = config;

    const measureGroupItems = preprocessMeasureGroupItems(measureGroup, {
        label: config.yLabel,
        format: config.yFormat,
    });

    const firstMeasureGroupItem = measureGroupItems[0];
    const secondMeasureGroupItem = measureGroupItems[1];
    const hasMoreThanOneMeasure = measureGroupItems.length > 1;
    const noPrimaryMeasures = dv.def().isBucketEmpty(BucketNames.MEASURES);

    const { measures: secondaryAxisMeasures = [] as string[] } =
        (isBarChart(type) ? config.secondary_xaxis : config.secondary_yaxis) || {};

    let yAxes: IAxis[] = [];

    if (isScatterPlot(type) || isBubbleChart(type)) {
        const hasSecondaryMeasure = !dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);

        if (hasSecondaryMeasure) {
            if (noPrimaryMeasures) {
                yAxes = [
                    {
                        ...firstMeasureGroupItem,
                    },
                ];
            } else {
                yAxes = [
                    {
                        ...secondMeasureGroupItem,
                    },
                ];
            }
        } else {
            yAxes = [{ label: "" }];
        }
    } else if (isHeatmap(type)) {
        yAxes = [
            {
                label: stackByAttribute ? stackByAttribute.formOf.name : "",
            },
        ];
    } else if (
        isOneOfTypes(type, supportedDualAxesChartTypes) &&
        !isEmpty(measureGroupItems) &&
        !isEmpty(secondaryAxisMeasures)
    ) {
        const { measuresInFirstAxis, measuresInSecondAxis }: IMeasuresInAxes = assignMeasuresToAxes(
            secondaryAxisMeasures,
            measureGroup,
        );

        let firstAxis: IAxis = createYAxisItem(measuresInFirstAxis, false);
        let secondAxis: IAxis = createYAxisItem(measuresInSecondAxis, true);

        if (firstAxis) {
            firstAxis = {
                ...firstAxis,
                ...getMeasureFormatKey(measuresInFirstAxis),
                seriesIndices: measuresInFirstAxis.map(({ index }: any) => index),
            };
        }
        if (secondAxis) {
            secondAxis = {
                ...secondAxis,
                ...getMeasureFormatKey(measuresInSecondAxis),
                seriesIndices: measuresInSecondAxis.map(({ index }: any) => index),
            };
        }

        yAxes = compact([firstAxis, secondAxis]);
    } else {
        // if more than one measure and NOT dual, then have empty item name
        const nonDualMeasureAxis = hasMoreThanOneMeasure
            ? {
                  label: "",
              }
            : {};
        yAxes = [
            {
                ...firstMeasureGroupItem,
                ...nonDualMeasureAxis,
                seriesIndices: range(measureGroupItems.length),
                ...getMeasureFormatKey(measureGroupItems),
            },
        ];
    }

    return yAxes;
}

interface IMeasuresInAxes {
    measuresInFirstAxis: any[];
    measuresInSecondAxis: any[];
}

function assignMeasuresToAxes(
    secondMeasures: string[],
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
): IMeasuresInAxes {
    return measureGroup.items.reduce(
        (
            result: any,
            { measureHeaderItem: { name, format, localIdentifier } }: IMeasureDescriptor,
            index,
        ) => {
            if (includes(secondMeasures, localIdentifier)) {
                result.measuresInSecondAxis.push({ name, format, index });
            } else {
                result.measuresInFirstAxis.push({ name, format, index });
            }
            return result;
        },
        {
            measuresInFirstAxis: [],
            measuresInSecondAxis: [],
        },
    );
}

function createYAxisItem(measuresInAxis: any[], opposite = false) {
    const length = measuresInAxis.length;
    if (length) {
        const { name, format } = measuresInAxis[0];
        return {
            label: length === 1 ? name : "",
            format,
            opposite,
        };
    }
    return null;
}

function assignYAxes(series: any, yAxes: IAxis[]) {
    return series.reduce((result: any, item: any, index: number) => {
        const yAxisIndex = yAxes.findIndex((axis: IAxis) => {
            return includes(get(axis, "seriesIndices", []), index);
        });
        // for case viewBy and stackBy have one attribute, and one measure is sliced to multiple series
        // then 'yAxis' in other series should follow the first one
        const firstYAxisIndex = result.lenght > 0 ? result[0].yAxis : 0;
        const seriesItem = {
            ...item,
            yAxis: yAxisIndex !== -1 ? yAxisIndex : firstYAxisIndex,
        };

        result.push(seriesItem);
        return result;
    }, []);
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

function getTooltipFactory(
    isViewByTwoAttributes: boolean,
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    config: IChartConfig = {},
    isDualAxis: boolean = false,
): ITooltipFactory {
    const { type } = config;
    if (isTreemap(type)) {
        return buildTooltipTreemapFactory(viewByAttribute, stackByAttribute, config);
    }
    if (isViewByTwoAttributes) {
        return buildTooltipForTwoAttributesFactory(
            viewByAttribute,
            viewByParentAttribute,
            config,
            isDualAxis,
        );
    }
    return buildTooltipFactory(viewByAttribute, type, config, isDualAxis);
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
