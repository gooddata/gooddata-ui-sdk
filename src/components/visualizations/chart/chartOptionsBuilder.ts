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
import { IChartConfig, IChartLimits } from './Chart';
import {
    parseValue,
    getAttributeElementIdFromAttributeElementUri,
    isLineChart,
    isAreaChart,
    isDualChart,
    isPieOrDonutChart,
    isComboChart,
    isTreemap,
    isChartSupported,
    stringifyChartTypes,
    isScatterPlot,
    isFunnelChart,
    isBubbleChart,
    unwrap,
    isHeatMap
} from '../utils/common';

import { getMeasureUriOrIdentifier, isDrillable } from '../utils/drilldownEventing';
import { DEFAULT_COLOR_PALETTE, getLighterColor } from '../utils/color';
import { isDataOfReasonableSize } from './highChartsCreators';
import { VIEW_BY_DIMENSION_INDEX, STACK_BY_DIMENSION_INDEX, PIE_CHART_LIMIT } from './constants';

import { DEFAULT_CATEGORIES_LIMIT } from './highcharts/commonConfiguration';
import { getComboChartOptions } from './chartOptions/comboChartOptions';
import { IDrillableItem } from '../../../interfaces/DrillEvents';
import { ChartType } from '../../../constants/visualizationTypes';

const enableAreaChartStacking = (stacking: any) => {
    return stacking || isUndefined(stacking);
};

export interface IAxis {
    label: string;
    format?: string;
    seriesIndices?: number[];
}

export interface ISeriesDataItem {
    x?: number;
    y: number;
    name?: string;
}

export interface ISeriesItem {
    name: string;
    data?: ISeriesDataItem[];
    color?: string;
    userOptions?: any;
}

export function isNegativeValueIncluded(series: ISeriesItem[]) {
    return series
        .some((seriesItem: ISeriesItem) => (
            seriesItem.data.some(({ y }: ISeriesDataItem) => (y < 0))
        ));
}

export function getAdjustedLimits(type: string, limits: IChartLimits): IChartLimits {
    const smallerLimits: IChartLimits = {
        series: 1, // pie charts/donuts/... can have just one series
        categories: Math.min(limits.categories || DEFAULT_CATEGORIES_LIMIT, PIE_CHART_LIMIT)
    };

    return (isPieOrDonutChart(type) || isFunnelChart(type)) ?
        smallerLimits : limits;
}

export function cannotShowNegativeValues(type: string) {
    return isPieOrDonutChart(type) ||
        isFunnelChart(type) ||
        isTreemap(type) ||
        isBubbleChart(type);
}

export function validateData(limits: IChartLimits = {}, chartOptions: any) {
    const { type } = chartOptions;

    return {
        dataTooLarge: !isDataOfReasonableSize(chartOptions.data, getAdjustedLimits(type, limits)),
        hasNegativeValue: cannotShowNegativeValues(type)
            && isNegativeValueIncluded(chartOptions.data.series)
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

export function isAttributeColorPalette(type: string, afm: AFM.IAfm, stackByAttribute: any) {
    const attributeChartSupported = isPieOrDonutChart(type) ||
        isFunnelChart(type) ||
        isScatterPlot(type) ||
        isBubbleChart(type) ||
        isTreemap(type);

    return stackByAttribute || (attributeChartSupported && afm.attributes && afm.attributes.length > 0);
}

export function getColorPalette(
    colorPalette: string[] = DEFAULT_COLOR_PALETTE,
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    viewByAttribute: any,
    stackByAttribute: any,
    afm: AFM.IAfm,
    type: string

): string[] {
    if (isHeatMap(type)) {
        return [];
    }

    if (isAttributeColorPalette(type, afm, stackByAttribute)) {
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
    x?: number;
    z?: number;
    value?: number;
    format: string;
    marker: {
        enabled: boolean;
    };
    name?: string;
    color?: string;
    legendIndex?: number;
}

export interface IPoint {
    x?: number;
    y: number;
    z?: number;
    value?: number;
    series: ISeriesItem;
    category?: string;
    format?: string;
    name?: string;
}

export function getSeriesItemData(
    seriesItem: string[],
    seriesIndex: number,
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
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
        } else if ((isPieOrDonutChart(type) || isFunnelChart(type) || isTreemap(type)) && !viewByAttribute) {
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
        } else if ((isPieOrDonutChart(type) || isFunnelChart(type) || isTreemap(type)) && viewByAttribute) {
            pointData.name = unwrap(viewByAttribute.items[viewByIndex]).name;
        } else {
            pointData.name = unwrap(measureGroup.items[measureIndex]).name;
        }

        if (isPieOrDonutChart(type) || isTreemap(type) || isFunnelChart(type)) {
            pointData.color = colorPalette[pointIndex];
            // Pie and Treemap charts use pointData viewByIndex as legendIndex if available
            // instead of seriesItem legendIndex
            pointData.legendIndex = viewByAttribute ? viewByIndex : pointIndex;
        }

        if (isTreemap(type)) {
            pointData.value = parseValue(pointValue);
        }

        return pointData;
    });
}

export interface ISeriesItemConfig {
    color: string;
    legendIndex: number;
    data?: any;
    name?: string;
    yAxis?: number;
    xAxis?: number;
}

export function getHeatMapSeries(
    executionResultData: Execution.DataValue[][],
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    viewByAttribute: any,
    stackByAttribute: any
) {
    const data = [] as any;
    executionResultData.forEach((rowItem: any, rowItemIndex: number) => {
        rowItem.forEach((columnItem: any, columnItemIndex: number) => {
            data.push({ x: columnItemIndex, y: rowItemIndex, value: parseValue(columnItem) });
        });
    });

    return[{
        name: measureGroup.items[0].measureHeaderItem.name,
        data,
        turboThreshold: 0,
        yAxis: 0,
        dataLabels: {
            enabled: ((!viewByAttribute || (viewByAttribute.items.length <= 6)) &&
                        (!stackByAttribute || (stackByAttribute.items.length <= 20))),
            formatGD: unwrap(measureGroup.items[0]).format
        },
        legendIndex: 0,
        borderWidth: ((!viewByAttribute || (viewByAttribute.items.length <= 30)) &&
                        (!stackByAttribute || (stackByAttribute.items.length <= 30))) ? 1 : 0
    }];
}

export function getScatterPlotSeries(
    executionResultData: Execution.DataValue[][],
    stackByAttribute: any,
    mdObject: VisualizationObject.IVisualizationObjectContent,
    colorPalette: string[]
) {
        const primaryMeasuresBucket = get(mdObject, ['buckets'], [])
            .find(bucket => bucket.localIdentifier === 'measures');
        const secondaryMeasuresBucket = get(mdObject, ['buckets'], [])
            .find(bucket => bucket.localIdentifier === 'secondary_measures');

        const primaryMeasuresBucketEmpty = isEmpty(get(primaryMeasuresBucket, 'items', []));
        const secondaryMeasuresBucketEmpty = isEmpty(get(secondaryMeasuresBucket, 'items', []));

        const data: ISeriesDataItem[] = executionResultData.map((seriesItem: string[], seriesIndex: number) => {
            const values = seriesItem.map((value: string) => {
                return parseValue(value);
            });

            return {
                x: !primaryMeasuresBucketEmpty ? values[0] : 0,
                y: !secondaryMeasuresBucketEmpty ? (primaryMeasuresBucketEmpty ? values[0] : values[1]) : 0,
                name: stackByAttribute ? stackByAttribute.items[seriesIndex].attributeHeaderItem.name : ''
            };
        });

        return data.map((dataItem: ISeriesDataItem, dataIndex: number) => {
            return {
                name: dataItem.name,
                color: colorPalette[dataIndex],
                legendIndex: dataIndex,
                data: [{
                    x: dataItem.x,
                    y: dataItem.y
                }]
            };
        });

}

export function getBubbleChartSeries(
    executionResultData: Execution.DataValue[][],
    stackByAttribute: any,
    colorPalette: string[]
) {
    return executionResultData.map((resData: any, index: number) => {
        return {
            name: stackByAttribute ? stackByAttribute.items[index].attributeHeaderItem.name : '',
            color: colorPalette[index],
            legendIndex: index,
            data: [{
                x: parseFloat(resData[0]),
                y: parseFloat(resData[1]),
                z: parseFloat(resData[2])
            }]
        };
    });
}

export function getSeries(
    executionResultData: Execution.DataValue[][],
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    viewByAttribute: any,
    stackByAttribute: any,
    type: string,
    mdObject: VisualizationObject.IVisualizationObjectContent,
    colorPalette: string[]
): any {
    if (isHeatMap(type)) {
        return getHeatMapSeries(executionResultData, measureGroup, viewByAttribute, stackByAttribute);
    } else if (isScatterPlot(type)) {
        return getScatterPlotSeries(executionResultData, stackByAttribute, mdObject, colorPalette);
    } else if (isBubbleChart(type)) {
        return getBubbleChartSeries(executionResultData, stackByAttribute, colorPalette);
    }
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
        } else if ((isPieOrDonutChart(type) || isFunnelChart(type)) && !viewByAttribute) {
            // Pie charts with measures only have a single series which name would is ambiguous
            seriesItemConfig.name = measureGroup.items.map((wrappedMeasure: Execution.IMeasureHeaderItem) => {
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
        } else if (isPieOrDonutChart(type) || isFunnelChart(type)) {
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

export function generateTooltipXYFn(measures: any, stackByAttribute: any) {
    const formatValue = (val: number, format: string) => {
        return colors2Object(numberFormat(val, format));
    };

    return (point: IPoint) => {
        const textData = [];

        if (stackByAttribute) {
            textData.unshift([customEscape(stackByAttribute.formOf.name), customEscape(point.series.name)]);
        }

        if (measures[0]) {
            textData.push([customEscape(measures[0].measureHeaderItem.name),
            customEscape(formatValue(point.x, measures[0].measureHeaderItem.format).label)]);
        }

        if (measures[1]) {
            textData.push([customEscape(measures[1].measureHeaderItem.name),
            customEscape(formatValue(point.y, measures[1].measureHeaderItem.format).label)]);
        }

        if (measures[2]) {
            textData.push([customEscape(measures[2].measureHeaderItem.name),
                customEscape(formatValue(point.z, measures[2].measureHeaderItem.format).label)]);
        }

        return `<table class="tt-values">${textData.map(line => (
            `<tr>
                <td class="title">${line[0]}</td>
                <td class="value">${line[1]}</td>
            </tr>`
        )).join('\n')}</table>`;
    };
}

export function generateTooltipHeatMapFn(viewByAttribute: any, stackByAttribute: any) {
    const formatValue = (val: number, format: string) => {
        return colors2Object(numberFormat(val, format));
    };

    return (point: IPoint) => {
        const formattedValue = customEscape(
            formatValue(point.value, point.series.userOptions.dataLabels.formatGD).label
        );
        const textData = [];

        textData.unshift([customEscape(point.series.name), formattedValue]);

        if (viewByAttribute) {
            textData.unshift([
                customEscape(viewByAttribute.formOf.name),
                customEscape(viewByAttribute.items[point.x].attributeHeaderItem.name)
            ]);
        }
        if (stackByAttribute) {
            textData.unshift([
                customEscape(stackByAttribute.formOf.name),
                customEscape(stackByAttribute.items[point.y].attributeHeaderItem.name)
            ]);
        }

        return `<table class="tt-values">${textData.map(line => (
            `<tr>
                <td class="title">${line[0]}</td>
                <td class="value">${line[1]}</td>
            </tr>`
        )).join('\n')}</table>`;
    };
}

export function findInDimensionHeaders(dimensions: Execution.IResultDimension[], headerCallback: Function): any {
    let returnValue: any = null;
    dimensions.some((dimension: any, dimensionIndex: any) => {
        dimension.headers.some(
            (wrappedHeader: Execution.IMeasureGroupHeader | Execution.IAttributeHeader, headerIndex: number) => {
                const headerType = Object.keys(wrappedHeader)[0];
                const header = wrappedHeader[headerType];
                const headerCount = dimension.headers.length;
                returnValue = headerCallback(headerType, header, dimensionIndex, headerIndex, headerCount);
                return !!returnValue;
            }
        );
        return !!returnValue;
    });
    return returnValue;
}

export function findMeasureGroupInDimensions(dimensions: Execution.IResultDimension[]) {
    return findInDimensionHeaders(dimensions,
        (headerType: string, header: Execution.IMeasureGroupHeader['measureGroupHeader'],
         {}, headerIndex: number, headerCount: number) => {
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

export function getDrillContext(stackByItem: any, viewByItem: any, measures: AFM.IMeasure[], afm: AFM.IAfm) {
    return without([
        ...measures,
        viewByItem,
        stackByItem
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
    drillableItems: IDrillableItem[],
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    viewByAttribute: any,
    stackByAttribute: any,
    type: ChartType,
    afm: AFM.IAfm
) {
    const isPieOrTreemapWithOnlyMeasures = (isPieOrDonutChart(type) || isTreemap(type) || isFunnelChart(type))
        && !viewByAttribute;

    return series.map((seriesItem: any, seriesIndex: number) => {
        let isSeriesDrillable = false;
        const data = seriesItem.data.map((pointData: IPointData, pointIndex: number) => {
            let measures = [];

            if (isScatterPlot(type)) {
                measures = get(measureGroup, 'items', []).slice(0, 2).map(unwrap);
            } else {
            // measureIndex is usually seriesIndex,
            // except for stack by attribute and metricOnly pie or treemap chart it is looped-around pointIndex instead
            // Looping around the end of items array only works when measureGroup is the last header on it's dimension
            // We do not support setups with measureGroup before attributeHeaders
                const measureIndex = !stackByAttribute && !isPieOrTreemapWithOnlyMeasures
                ? seriesIndex : pointIndex % measureGroup.items.length;

                measures = [unwrap(measureGroup.items[measureIndex])];
            }

            const viewByIndex = isHeatMap(type) ? pointData.x : pointIndex;
            const stackByIndex = isHeatMap(type) ? pointData.y : seriesIndex;

            const viewByItem = viewByAttribute ? {
                ...unwrap(viewByAttribute.items[viewByIndex]),
                attribute: viewByAttribute
            } : null;

            // stackBy item index is always equal to seriesIndex
            const stackByItem = stackByAttribute ? {
                ...unwrap(stackByAttribute.items[stackByIndex]),
                attribute: stackByAttribute
            } : null;

            // point is drillable if a drillableItem matches:
            //   point's measure,
            //   point's viewBy attribute,
            //   point's viewBy attribute item,
            //   point's stackBy attribute,
            //   point's stackBy attribute item,
            const drillableHooks = without([
                ...measures,
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
                drillableProps.drillContext = getDrillContext(stackByItem, viewByItem, measures, afm);
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

function getCategories(type: string, measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
                       viewByAttribute: any, stackByAttribute: any) {
    if (isHeatMap(type)) {
        return [
            viewByAttribute ? viewByAttribute.items.map((item: any) => item.attributeHeaderItem.name) : [''],
            stackByAttribute ? stackByAttribute.items.map((item: any) => item.attributeHeaderItem.name) : ['']
        ];
    }

    // Categories make up bar/slice labels in charts. These usually match view by attribute values.
    // Measure only pie or treemap charts get categories from measure names
    if (viewByAttribute) {
        return viewByAttribute.items.map(({ attributeHeaderItem }: any) => attributeHeaderItem.name);
    }
    if (isPieOrDonutChart(type) || isTreemap(type) || isFunnelChart(type)) {
        // Pie or Treemap chart with measures only (no viewByAttribute) needs to list
        return measureGroup.items.map((wrappedMeasure: Execution.IMeasureHeaderItem) => unwrap(wrappedMeasure).name);
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

function preprocessMeasureGroupItems(measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
                                     defaultValues: any): any[] {
    return measureGroup.items.map((item: Execution.IMeasureHeaderItem, index: number) => {
        const unwrapped = unwrap(item);
        return index ? {
            label: unwrapped.name,
            format: unwrapped.format
        } : {
            label: defaultValues.label || unwrapped.name,
            format: defaultValues.format || unwrapped.format
        };
    });
}

function getXAxes(config: IChartConfig, measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
                  viewByAttribute: any): IAxis[] {
    const { type, mdObject } = config;
    const measureGroupItems = preprocessMeasureGroupItems(measureGroup,
        { label: config.xLabel, format: config.xFormat });

    const firstMeasureGroupItem = measureGroupItems[0];

    if (isScatterPlot(type) || isBubbleChart(type)) {
        const noPrimaryMeasures = isPrimaryMeasuresBucketEmpty(mdObject);
        if (noPrimaryMeasures) {
            return [{
                label: ''
            }];
        } else {
            return [{
                label: firstMeasureGroupItem.label || '',
                format: firstMeasureGroupItem.format || ''
            }];
        }
    }

    const xLabel = config.xLabel || (viewByAttribute ? viewByAttribute.formOf.name : '');
    return [{
        label: xLabel
    }];
}

function getYAxes(config: IChartConfig, measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
                  stackByAttribute: any): IAxis[] {
    const { type, mdObject } = config;

    const measureGroupItems = preprocessMeasureGroupItems(measureGroup,
        { label: config.yLabel, format: config.yFormat });

    const firstMeasureGroupItem = measureGroupItems[0];
    const secondMeasureGroupItem = measureGroupItems[1];
    const hasMoreThanOneMeasure = measureGroupItems.length > 1;
    const noPrimaryMeasures = isPrimaryMeasuresBucketEmpty(mdObject);

    let yAxes: IAxis[] = [];

    if (isDualChart(type)) {
        if (noPrimaryMeasures) {
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
    } else if (isScatterPlot(type) || isBubbleChart(type)) {
        if (noPrimaryMeasures) {
            yAxes = [{
                ...firstMeasureGroupItem,
                seriesIndices: range(measureGroupItems.length)
            }];
        } else {
            yAxes = [{
                ...secondMeasureGroupItem,
                seriesIndices: range(measureGroupItems.length)
            }];
        }
    } else if (isHeatMap(type)) {
        yAxes = [{
            label: stackByAttribute ? stackByAttribute.name : ''
        }];
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
    dimensions: Execution.IResultDimension[],
    executionResultData: Execution.DataValue[][],
    unfilteredHeaderItems: Execution.IResultHeaderItem[][][],
    config: IChartConfig,
    drillableItems: IDrillableItem[]
) {
    // Future version of API will return measures alongside attributeHeaderItems
    // we need to filter these out in order to stay compatible
    const attributeHeaderItems = unfilteredHeaderItems.map((dimension: Execution.IResultHeaderItem[][]) => {
        return dimension.filter((attributeHeaders: any) => attributeHeaders[0].attributeHeaderItem);
    });

    invariant(config && isChartSupported(config.type),
        `config.type must be defined and match one of supported chart types: ${stringifyChartTypes()}`);

    const { type, mdObject } = config;
    const measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'] = findMeasureGroupInDimensions(dimensions);
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
    const gridEnabled = get(config, 'grid.enabled', true);
    const stacking = getStackingConfig(stackByAttribute, config);
    const xAxes = getXAxes(config, measureGroup, viewByAttribute);
    const yAxes = getYAxes(config, measureGroup, stackByAttribute);

    const seriesWithoutDrillability = getSeries(
        executionResultData,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        type,
        mdObject,
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

    const series = assignYAxes(drillableSeries, yAxes);

    let categories = getCategories(type, measureGroup, viewByAttribute, stackByAttribute);

    // Pie charts dataPoints are sorted by default by value in descending order
    if (isPieOrDonutChart(type) || isFunnelChart(type)) {
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

    if (isComboChart(type)) {
        return {
            type,
            stacking,
            colorPalette,
            xAxes,
            yAxes,
            legendLayout: config.legendLayout || 'horizontal',
            dualAxis: false,
            actions: {
                tooltip: generateTooltipFn(viewByAttribute, type)
            },
            grid: {
                enabled: gridEnabled
            },
            ...getComboChartOptions(
                config,
                measureGroup,
                series,
                categories
            )
        };
    }

    if (isScatterPlot(type)) {
        const measures = [
            measureGroup.items[0] ? measureGroup.items[0] : null,
            measureGroup.items[1] ? measureGroup.items[1] : null
        ];

        const categories = [''];

        return {
            type,
            stacking,
            legendLayout: 'horizontal',
            colorPalette,
            yAxes,
            xAxes,
            showInPercent: false,
            data: {
                series,
                categories
            },
            actions: {
                tooltip: generateTooltipXYFn(measures, stackByAttribute)
            },
            grid: {
                enabled: gridEnabled
            }
        };
    }

    if (isHeatMap(type)) {
        return {
            type,
            stacking: null as any,
            legendLayout: 'horizontal',
            title: {
                x: (viewByAttribute ? viewByAttribute.name : ''),
                y: (stackByAttribute ? stackByAttribute.name : ''),
                format: unwrap(measureGroup.items[0]).format
            },
            xAxes,
            yAxes,
            showInPercent: false,
            data: {
                series,
                categories
            },
            actions: {
                tooltip: generateTooltipHeatMapFn(viewByAttribute, stackByAttribute)
            },
            grid: {
                enabled: false
            },
            colorPalette: [] as any
        };
    }

    if (isBubbleChart(type)) {
        const measures = [
            measureGroup.items[0] ? measureGroup.items[0] : null,
            measureGroup.items[1] ? measureGroup.items[1] : null,
            measureGroup.items[2] ? measureGroup.items[2] : null
        ];

        return {
            type,
            stacking,
            legendLayout: 'horizontal',
            colorPalette,
            yAxes,
            xAxes,
            showInPercent: false,
            data: {
                series,
                categories: ['']
            },
            actions: {
                tooltip: generateTooltipXYFn(measures, stackByAttribute)
            },
            grid: {
                enabled: gridEnabled
            }
        };
    }

    return {
        type,
        stacking,
        hasStackByAttribute: Boolean(stackByAttribute),
        legendLayout: config.legendLayout || 'horizontal',
        colorPalette,
        xAxes,
        yAxes,
        showInPercent: measureGroup.items.some((wrappedMeasure: Execution.IMeasureHeaderItem) => {
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
