// (C) 2007-2018 GoodData Corporation
import { colors2Object, numberFormat } from '@gooddata/numberjs';
import * as invariant from 'invariant';
import { AFM, Execution, VisualizationObject } from '@gooddata/typings';

import range = require('lodash/range');
import get = require('lodash/get');
import includes = require('lodash/includes');
import isEmpty = require('lodash/isEmpty');
import compact = require('lodash/compact');
import without = require('lodash/without');
import escape = require('lodash/escape');
import unescape = require('lodash/unescape');
import isUndefined = require('lodash/isUndefined');
import { IChartConfig } from './Chart';
import {
    parseValue,
    getAttributeElementIdFromAttributeElementUri,
    isLineChart,
    isAreaChart,
    isDualChart,
    isPieChart,
    isChartSupported,
    stringifyChartTypes
} from '../utils/common';

import { getMeasureUriOrIdentifier, isDrillable } from '../utils/drilldownEventing';
import { DEFAULT_COLOR_PALETTE, getLighterColor } from '../utils/color';
import { isDataOfReasonableSize } from './highChartsCreators';
import { VIEW_BY_DIMENSION_INDEX, STACK_BY_DIMENSION_INDEX, PIE_CHART_LIMIT } from './constants';

import { DEFAULT_CATEGORIES_LIMIT } from './highcharts/commonConfiguration';

const enableAreaChartStacking = (stacking: any) => {
    return stacking || isUndefined(stacking);
};

export interface IAxis {
    label: string;
    format?: string;
    seriesIndices?: number[];
}

export function unwrap(wrappedObject: any) {
    return wrappedObject[Object.keys(wrappedObject)[0]];
}

export interface ISeriesDataItem {
    y: number;
}

export interface ISeriesItem {
    data?: ISeriesDataItem[];
    name: string;
}

export function isNegativeValueIncluded(series: ISeriesItem[]) {
    return series
        .some((seriesItem: ISeriesItem) => (
            seriesItem.data.some(({ y }: ISeriesDataItem) => (y < 0))
        ));
}

export function validateData(limits: any = {}, chartOptions: any) {
    const pieChartLimits = {
        series: 1, // pie charts can have just one series
        categories: Math.min(limits.categories || DEFAULT_CATEGORIES_LIMIT, PIE_CHART_LIMIT)
    };

    const { type } = chartOptions;

    return {
        // series and categories limit
        dataTooLarge: !isDataOfReasonableSize(chartOptions.data, isPieChart(type)
            ? pieChartLimits
            : limits),
        // check pie chart for negative values
        hasNegativeValue: isPieChart(type) && isNegativeValueIncluded(chartOptions.data.series)
    };
}

export function isPopMeasure(measureItem: Execution.IMeasureHeaderItem, afm: AFM.IAfm) {
    return afm.measures.some((measure: AFM.IMeasure) => {
        const popMeasureIdentifier = get(measure, 'definition.popMeasure') ? measure.localIdentifier : null;
        return popMeasureIdentifier && popMeasureIdentifier === measureItem.measureHeaderItem.localIdentifier;
    });
}

export function normalizeColorToRGB(color: string) {
    const hexPattern = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i;
    return color.replace(hexPattern, ({}, r: string, g: string, b: string) => {
        return `rgb(${[r, g, b].map(value => (parseInt(value, 16).toString(10))).join(', ')})`;
    });
}

function findParentMeasureIndex(afm: AFM.IAfm, measureItemIndex: number): number {
    const measureDefinition = afm.measures[measureItemIndex].definition;
    if (!AFM.isPopMeasureDefinition(measureDefinition)) {
        return -1;
    }
    const sourceMeasureIdentifier = measureDefinition.popMeasure.measureIdentifier;
    return afm.measures.findIndex(
        (measure: AFM.IMeasure) => measure.localIdentifier === sourceMeasureIdentifier
    );
}

export function getColorPalette(
    colorPalette: string[] = DEFAULT_COLOR_PALETTE,
    measureGroup: any,
    viewByAttribute: any,
    stackByAttribute: any,
    afm: AFM.IAfm,
    type: string
): string[] {
    const isAttributePieChart = isPieChart(type) && afm.attributes && afm.attributes.length > 0;

    if (stackByAttribute || isAttributePieChart) {
        const itemsCount = stackByAttribute ? stackByAttribute.items.length : viewByAttribute.items.length;
        return range(itemsCount).map(itemIndex => colorPalette[itemIndex % colorPalette.length]);
    }

    let parentMeasuresCounter = 0;

    const paletteMeasures = range(measureGroup.items.length).map((measureItemIndex) => {
        if (isPopMeasure(measureGroup.items[measureItemIndex], afm)) {
            return '';
        }
        const colorIndex = parentMeasuresCounter % colorPalette.length;
        parentMeasuresCounter++;
        return colorPalette[colorIndex];
    });

    return paletteMeasures.map((color, measureItemIndex) => {
        if (!isPopMeasure(measureGroup.items[measureItemIndex], afm)) {
            return color;
        }
        const parentMeasureIndex = findParentMeasureIndex(afm, measureItemIndex);
        if (parentMeasureIndex > -1) {
            const sourceMeasureColor = paletteMeasures[parentMeasureIndex];
            return getLighterColor(normalizeColorToRGB(sourceMeasureColor), 0.6);
        }
        return color;
    });
}

export interface IPointData {
    y: number;
    format: string;
    marker: {
        enabled: boolean;
    };
    name?: string;
    color?: string;
    legendIndex?: number;
}

export interface IPoint {
    y: number;
    series: ISeriesItem;
    category: string;
    format: string;
    name: string;
}

export function getSeriesItemData(
    seriesItem: string[],
    seriesIndex: number,
    measureGroup: any,
    viewByAttribute: any,
    stackByAttribute: any,
    type: string,
    colorPalette: string[]
) {
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
        } else if (isPieChart(type) && !viewByAttribute) {
            measureIndex = pointIndex;
        }

        const pointData: IPointData = {
            y: parseValue(pointValue),
            format: unwrap(measureGroup.items[measureIndex]).format,
            marker: {
                enabled: pointValue !== null
            }
        };
        if (stackByAttribute) {
            // if there is a stackBy attribute, then seriesIndex corresponds to stackBy label index
            pointData.name = unwrap(stackByAttribute.items[seriesIndex]).name;
        } else if (isPieChart(type) && viewByAttribute) {
            pointData.name = unwrap(viewByAttribute.items[viewByIndex]).name;
        } else {
            pointData.name = unwrap(measureGroup.items[measureIndex]).name;
        }

        if (isPieChart(type)) {
            // add color to pie chart points from colorPalette
            pointData.color = colorPalette[pointIndex];
            // Pie charts use pointData viewByIndex as legendIndex if available instead of seriesItem legendIndex
            pointData.legendIndex = viewByAttribute ? viewByIndex : pointIndex;
        }
        return pointData;
    });
}

interface ISeriesItemConfig {
    color: string;
    legendIndex: number;
    data?: any;
    name?: string;
    yAxis?: number;
}

export function getSeries(
    executionResultData: any,
    measureGroup: any,
    viewByAttribute: any,
    stackByAttribute: any,
    type: string,
    colorPalette: string[]
) {
    return executionResultData.map((seriesItem: string[], seriesIndex: number) => {
        const seriesItemData = getSeriesItemData(
            seriesItem,
            seriesIndex,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            type,
            colorPalette
        );
        const seriesItemConfig: ISeriesItemConfig = {
            color: colorPalette[seriesIndex],
            legendIndex: seriesIndex,
            data: seriesItemData
        };

        if (isDualChart(type) && seriesIndex > 0) {
            seriesItemConfig.yAxis = 1;
        }

        if (stackByAttribute) {
            // if stackBy attribute is available, seriesName is a stackBy attribute value of index seriesIndex
            // this is a limitiation of highcharts and a reason why you can not have multi-measure stacked charts
            seriesItemConfig.name = stackByAttribute.items[seriesIndex].attributeHeaderItem.name;
        } else if (isPieChart(type) && !viewByAttribute) {
            // Pie charts with measures only have a single series which name would is ambiguous
            seriesItemConfig.name = measureGroup.items.map((wrappedMeasure: VisualizationObject.IMeasure) => {
                return unwrap(wrappedMeasure).name;
            }).join(', ');
        } else {
            // otherwise seriesName is a measure name of index seriesIndex
            seriesItemConfig.name = measureGroup.items[seriesIndex].measureHeaderItem.name;
        }

        return seriesItemConfig;
    });
}

export const customEscape = (str: string) => str && escape(unescape(str));

export function generateTooltipFn(viewByAttribute: any, type: string) {
    const formatValue = (val: number, format: string) => {
        return colors2Object(numberFormat(val, format));
    };

    return (point: IPoint) => {
        const formattedValue = customEscape(formatValue(point.y, point.format).label);
        const textData = [[customEscape(point.series.name), formattedValue]];

        if (viewByAttribute) {
            // For some reason, highcharts ommit categories for pie charts with attribute. Use point.name instead.
            // use attribute name instead of attribute display form name
            textData.unshift([customEscape(viewByAttribute.formOf.name), customEscape(point.category || point.name)]);
        } else if (isPieChart(type)) {
            // Pie charts with measure only have to use point.name instead of series.name to get the measure name
            textData[0][0] = customEscape(point.name);
        }

        return `<table class="tt-values">${textData.map(line => (
            `<tr>
                <td class="title">${line[0]}</td>
                <td class="value">${line[1]}</td>
            </tr>`
        )).join('\n')}</table>`;
    };
}

export function findInDimensionHeaders(dimensions: any, headerCallback: any): any {
    let returnValue: any = null;
    dimensions.some((dimension: any, dimensionIndex: any) => {
        dimension.headers.some((wrappedHeader: any, headerIndex: number) => {
            const headerType = Object.keys(wrappedHeader)[0];
            const header = wrappedHeader[headerType];
            const headerCount = dimension.headers.length;
            returnValue = headerCallback(headerType, header, dimensionIndex, headerIndex, headerCount);
            return !!returnValue;
        });
        return !!returnValue;
    });
    return returnValue;
}

export function findMeasureGroupInDimensions(dimensions: any) {
    return findInDimensionHeaders(dimensions,
        (headerType: any, header: any, {}, headerIndex: any, headerCount: any) => {
            const measureGroupHeader = headerType === 'measureGroupHeader' ? header : null;
            if (measureGroupHeader) {
                invariant(headerIndex === headerCount - 1, 'MeasureGroup must be the last header in it\'s dimension');
            }
            return measureGroupHeader;
        });
}

export function findAttributeInDimension(dimension: any, attributeHeaderItemsDimension: any) {
    return findInDimensionHeaders([dimension], (headerType: any, header: any) => {
        if (headerType === 'attributeHeader') {
            return {
                ...header,
                // attribute items are delivered separately from attributeHeaderItems
                // there should ever only be maximum of one attribute on each dimension, other attributes are ignored
                items: attributeHeaderItemsDimension[0]
            };
        }
        return null;
    });
}

export function getDrillContext(stackByItem: any, viewByItem: any, measure: AFM.IMeasure, afm: AFM.IAfm) {
    return without([
        stackByItem,
        viewByItem,
        measure
    ], null).map(({
        uri, // header attribute value or measure uri
        identifier = '', // header attribute value or measure identifier
        name, // header attribute value or measure text label
        format, // measure format
        localIdentifier,
        attribute // attribute header if available
    }) => {
        return {
            id: attribute
                ? getAttributeElementIdFromAttributeElementUri(uri)
                : localIdentifier, // attribute value id or measure localIndentifier
            ...(attribute ? {} : {
                format
            }),
            value: name, // text label of attribute value or formatted measure value
            identifier: attribute ? attribute.identifier : identifier, // identifier of attribute or measure
            uri: attribute
                ? attribute.uri // uri of attribute
                : get(getMeasureUriOrIdentifier(afm, localIdentifier), 'uri') // uri of measure
        };
    });
}

export function getDrillableSeries(
    series: any,
    drillableItems: any,
    measureGroup: any,
    viewByAttribute: any,
    stackByAttribute: any,
    type: string,
    afm: AFM.IAfm
) {
    const isMetricPieChart = isPieChart(type) && !viewByAttribute;

    return series.map((seriesItem: any, seriesIndex: number) => {
        let isSeriesDrillable = false;
        const data = seriesItem.data.map((pointData: IPointData, pointIndex: number) => {
            // measureIndex is usually seriesIndex,
            // except for stack by attribute and metricOnly pie chart it is looped-around pointIndex instead
            // Looping around the end of items array only works when measureGroup is the last header on it's dimension
            // We do not support setups with measureGroup before attributeHeaders
            const measureIndex = !stackByAttribute && !isMetricPieChart
                ? seriesIndex
                : pointIndex % measureGroup.items.length;
            const measure = unwrap(measureGroup.items[measureIndex]);

            const viewByItem = viewByAttribute ? {
                ...unwrap(viewByAttribute.items[pointIndex]),
                attribute: viewByAttribute
            } : null;

            // stackBy item index is always equal to seriesIndex
            const stackByItem = stackByAttribute ? {
                ...unwrap(stackByAttribute.items[seriesIndex]),
                attribute: stackByAttribute
            } : null;

            // point is drillable if a drillableItem matches:
            //   point's measure,
            //   point's viewBy attribute,
            //   point's viewBy attribute item,
            //   point's stackBy attribute,
            //   point's stackBy attribute item,
            const drillableHooks = without([
                measure,
                viewByAttribute,
                viewByItem,
                stackByAttribute,
                stackByItem
            ], null);

            const drilldown = drillableHooks.some(drillableHook =>
                isDrillable(drillableItems, drillableHook, afm)
            );

            const drillableProps: any = {
                drilldown
            };
            if (drilldown) {
                drillableProps.drillContext = getDrillContext(measure, viewByItem, stackByItem, afm);
                isSeriesDrillable = true;
            }
            return {
                ...pointData,
                ...drillableProps
            };
        });

        return {
            ...seriesItem,
            data,
            isDrillable: isSeriesDrillable
        };
    });
}

function getCategories(type: string, viewByAttribute: any, measureGroup: any) {
    // Categories make up bar/slice labels in charts. These usually match view by attribute values.
    // Measure only pie charts geet categories from measure names
    if (viewByAttribute) {
        return viewByAttribute.items.map(({ attributeHeaderItem }: any) => attributeHeaderItem.name);
    }
    if (isPieChart(type)) {
        // Pie chart with measures only (no viewByAttribute) needs to list
        return measureGroup.items.map((wrappedMeasure: VisualizationObject.IMeasure) => unwrap(wrappedMeasure).name);
        // Pie chart categories are later sorted by seriesItem pointValue
    }
    return [];
}

function getStackingConfig(stackByAttribute: any, options: any) {
    const stackingValue = 'normal';
    const { type, stacking } = options;

    const isNotLineOrAreaChart = !(isLineChart(type) || isAreaChart(type));

    /**
     * we should enable stacking for one of the following cases :
     * 1) If stackby attibute have been set and chart is not line/area chart
     * 2) If chart is an area chart and stacking is enabled (stackBy attribute doesn't matter)
     */
    const isStackByChart = stackByAttribute && isNotLineOrAreaChart;
    const isAreaChartWithEnabledStacking = isAreaChart(type) && enableAreaChartStacking(stacking);
    if (isStackByChart || isAreaChartWithEnabledStacking) {
        return stackingValue;
    }

    // No stacking
    return null;
}

function isPrimaryMeasuresBucketEmpty(mdObject: VisualizationObject.IVisualizationObjectContent) {
    const primaryMeasuresBucket = get(mdObject, 'buckets', [])
        .find(bucket => bucket.localIdentifier === 'measures');

    const primaryMeasuresBucketItems = get(primaryMeasuresBucket, 'items', []);
    return isEmpty(primaryMeasuresBucketItems);
}

function getYAxes(config: IChartConfig, measureGroup: any): IAxis[] {
    const { type, mdObject } = config;
    const measureGroupItems = measureGroup.items.map((item: VisualizationObject.IMeasure, index: number) => {
        const unwrapped = unwrap(item);
        return index ? {
            label: unwrapped.name,
            format: unwrapped.format
        } : {
            label: config.yLabel || unwrapped.name,
            format: config.yFormat || unwrapped.format
        };
    });
    const firstMeasureGroupItem = measureGroupItems[0];
    const secondMeasureGroupItem = measureGroupItems[1];
    const hasMoreThanOneMeasure = measureGroupItems.length > 1;

    let yAxes: IAxis[] = [];
    if (isDualChart(type)) {
        const noPrimaryMeasures = isPrimaryMeasuresBucketEmpty(mdObject);
        if (firstMeasureGroupItem && noPrimaryMeasures) {
            yAxes = [null, {
                ...firstMeasureGroupItem,
                opposite: true,
                seriesIndices: range(measureGroupItems.length)
            }];
        } else {
            const firstAxis = {
                ...firstMeasureGroupItem,
                seriesIndices: [0]
            };
            const secondAxis = secondMeasureGroupItem ? {
                ...secondMeasureGroupItem,
                opposite: true,
                seriesIndices: range(1, measureGroupItems.length)
            } : null;
            yAxes = compact([firstAxis, secondAxis]);
        }
    } else {
        // if more than one measure and NOT dual, then have empty item name
        const nonDualMeasureAxis = hasMoreThanOneMeasure ? {
            label: ''
        } : {};
        yAxes = [{
            ...firstMeasureGroupItem,
            ...nonDualMeasureAxis,
            seriesIndices: range(measureGroupItems.length)
        }];
    }

    return yAxes;
}

function assignYAxes(series: any, yAxes: IAxis[]) {
    series.forEach((seriesItem: any, index: number) => {
        const yAxisIndex = yAxes.findIndex((axis: IAxis) => {
            return includes(get(axis, 'seriesIndices', []), index);
        });

        if (yAxisIndex !== -1) {
            seriesItem.yAxis = yAxisIndex;
        }
    });

    return series;
}

/**
 * Creates an object providing data for all you need to render a chart except drillability.
 *
 * @param afm <executionRequest.AFM> object listing metrics and attributes used.
 * @param resultSpec <executionRequest.resultSpec> object defining expected result dimension structure,
 * @param dimensions <executionResponse.dimensions> array defining calculated dimensions and their headers,
 * @param executionResultData <executionResult.data> array with calculated data
 * @param unfilteredHeaderItems <executionResult.headerItems> array of attribute header items mixed with measures
 * @param config object defining chart display settings
 * @param drillableItems array of items for isPointDrillable matching
 * @return Returns composed chart options object
 */
export function getChartOptions(
    afm: AFM.IAfm,
    {},
    dimensions: any,
    executionResultData: any,
    unfilteredHeaderItems: any,
    config: any,
    drillableItems: any
) {
    // Future version of API will return measures alongside attributeHeaderItems
    // we need to filter these out in order to stay compatible
    const attributeHeaderItems = unfilteredHeaderItems.map((dimension: any) => {
        return dimension.filter((attributeHeaders: any) => attributeHeaders[0].attributeHeaderItem);
    });

    invariant(config && isChartSupported(config.type),
        `config.type must be defined and match one of supported chart types: ${stringifyChartTypes()}`);

    const { type } = config;
    const measureGroup = findMeasureGroupInDimensions(dimensions);
    const viewByAttribute = findAttributeInDimension(
        dimensions[VIEW_BY_DIMENSION_INDEX],
        attributeHeaderItems[VIEW_BY_DIMENSION_INDEX]
    );
    const stackByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        attributeHeaderItems[STACK_BY_DIMENSION_INDEX]
    );

    invariant(measureGroup, 'missing measureGroup');

    const colorPalette =
        getColorPalette(config.colors, measureGroup, viewByAttribute, stackByAttribute, afm, type);

    const seriesWithoutDrillability = getSeries(
        executionResultData,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        type,
        colorPalette
    );

    const drillableSeries = getDrillableSeries(
        seriesWithoutDrillability,
        drillableItems,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        type,
        afm
    );

    const yAxes = getYAxes(config, measureGroup);
    const series = assignYAxes(drillableSeries, yAxes);

    let categories = getCategories(type, viewByAttribute, measureGroup);
    const stacking = getStackingConfig(stackByAttribute, config);

    // Pie charts dataPoints are sorted by default by value in descending order
    if (isPieChart(type)) {
        const dataPoints = series[0].data;
        const indexSortOrder: number[] = [];
        const sortedDataPoints = dataPoints.sort((pointDataA: IPointData, pointDataB: IPointData) => {
            if (pointDataA.y === pointDataB.y) { return 0; }
            return pointDataB.y - pointDataA.y;
        }).map((dataPoint: IPointData, dataPointIndex: number) => {
            // Legend index equals original dataPoint index
            indexSortOrder.push(dataPoint.legendIndex);
            return {
                // after sorting, colors need to be reassigned in original order and legendIndex needs to be reset
                ...dataPoint,
                color: get(dataPoints[dataPoint.legendIndex], 'color'),
                legendIndex: dataPointIndex
            };
        });
        // categories need to be sorted in exactly the same order as dataPoints
        categories = categories.map(({}, dataPointIndex: number) => categories[indexSortOrder[dataPointIndex]]);
        series[0].data = sortedDataPoints;
    }

    // Attribute axis labels come from attribute instead of attribute display form.
    // They are listed in attribute headers. So we need to find one attribute header and read the attribute name
    const xLabel = config.xLabel || (viewByAttribute ? viewByAttribute.formOf.name : '');
    // if there is only one measure, yLabel is name of this measure, otherwise an empty string
    const yLabel = config.yLabel || (measureGroup.items.length === 1 ? unwrap(measureGroup.items[0]).name : '');
    const yFormat = config.yFormat || unwrap(measureGroup.items[0]).format;
    const gridEnabled = get(config, 'grid.enabled', true);

    return {
        type,
        stacking,
        hasStackByAttribute: Boolean(stackByAttribute),
        legendLayout: config.legendLayout || 'horizontal',
        colorPalette,
        title: {
            x: xLabel,
            y: yLabel,
            yFormat
        },
        yAxes,
        showInPercent: measureGroup.items.some((wrappedMeasure: VisualizationObject.IMeasure) => {
            const measure = wrappedMeasure[Object.keys(wrappedMeasure)[0]];
            return measure.format.includes('%');
        }),
        data: {
            series,
            categories
        },
        actions: {
            tooltip: generateTooltipFn(viewByAttribute, type)
        },
        grid: {
            enabled: gridEnabled
        }
    };
}
