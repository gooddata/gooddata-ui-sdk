// (C) 2007-2018 GoodData Corporation
import { colors2Object, numberFormat } from '@gooddata/numberjs';
import * as invariant from 'invariant';
import { AFM, Execution, VisualizationObject } from '@gooddata/typings';
import { IColorPalette } from '@gooddata/gooddata-js';
import * as Highcharts from 'highcharts';

import cloneDeep = require('lodash/cloneDeep');
import compact = require('lodash/compact');
import escape = require('lodash/escape');
import get = require('lodash/get');
import includes = require('lodash/includes');
import isEmpty = require('lodash/isEmpty');
import isEqual = require('lodash/isEqual');
import isUndefined = require('lodash/isUndefined');
import last = require('lodash/last');
import range = require('lodash/range');
import unescape = require('lodash/unescape');
import without = require('lodash/without');

import {
    getAttributeElementIdFromAttributeElementUri,
    isAreaChart,
    isBarChart,
    isBubbleChart,
    isChartSupported,
    isComboChart,
    isHeatmap,
    isOneOfTypes,
    isScatterPlot,
    isTreemap,
    parseValue,
    stringifyChartTypes
} from '../utils/common';
import { getChartProperties } from './highcharts/helpers';
import { unwrap } from '../../../helpers/utils';

import { getMeasureUriOrIdentifier, isDrillable } from '../utils/drilldownEventing';
import { getLighterColor } from '../utils/color';
import { isDataOfReasonableSize } from './highChartsCreators';
import {
    VIEW_BY_DIMENSION_INDEX,
    STACK_BY_DIMENSION_INDEX,
    PIE_CHART_LIMIT,
    HEATMAP_DATA_POINTS_LIMIT
} from './constants';
import { VisualizationTypes, VisType } from '../../../constants/visualizationTypes';
import { MEASURES, SECONDARY_MEASURES, TERTIARY_MEASURES, VIEW, SEGMENT } from '../../../constants/bucketNames';

import {
    DEFAULT_SERIES_LIMIT,
    DEFAULT_CATEGORIES_LIMIT,
    DEFAULT_DATA_POINTS_LIMIT
} from './highcharts/commonConfiguration';
import { getComboChartOptions } from './chartOptions/comboChartOptions';
import { IDrillableItem } from '../../../interfaces/DrillEvents';

import { ColorFactory, IColorStrategy } from './colorFactory';
import { IColorAssignment, IChartLimits, IChartConfig } from '../../../interfaces/Config';

const enableAreaChartStacking = (stacking: any) => {
    return stacking || isUndefined(stacking);
};

// types with only many measures or one measure and one attribute
const multiMeasuresAlternatingTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.TREEMAP
];

const unsupportedNegativeValuesTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.TREEMAP
];

// charts sorted by default by measure value
const sortedByMeasureTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL
];

const unsupportedStackingTypes = [
    VisualizationTypes.LINE,
    VisualizationTypes.AREA,
    VisualizationTypes.SCATTER,
    VisualizationTypes.BUBBLE
];

export const supportedDualAxesChartTypes = [
    VisualizationTypes.COLUMN,
    VisualizationTypes.BAR,
    VisualizationTypes.LINE
];

export interface IAxis {
    label: string;
    format?: string;
    opposite?: boolean;
    seriesIndices?: number[];
}

export interface ISeriesDataItem {
    x?: number;
    y: number;
    value?: number;
    name?: string;
}

export interface ISeriesItem {
    name: string;
    data?: ISeriesDataItem[];
    color?: string;
    userOptions?: any;
    visible?: boolean;
}

export interface IChartOptions {
    type?: string;
    stacking?: any;
    hasStackByAttribute?: boolean;
    hasViewByAttribute?: boolean;
    legendLayout?: string;
    dualAxis?: boolean;
    xAxes?: any;
    yAxes?: any;
    data?: any;
    actions?: any;
    grid?: any;
    xAxisProps?: any;
    yAxisProps?: any;
    secondary_xAxisProps?: any;
    secondary_yAxisProps?: any;
    title?: any;
    colorAxis?: Highcharts.ColorAxisOptions;
    colorAssignments?: IColorAssignment[];
    colorPalette?: IColorPalette;
}

export function isNegativeValueIncluded(series: ISeriesItem[]) {
    return series
        .some((seriesItem: ISeriesItem) => (
            seriesItem.data.some(({ y, value }: ISeriesDataItem) => (y < 0 || value < 0))
        ));
}

function getChartLimits(type: string): IChartLimits {
    switch (type) {
        case VisualizationTypes.SCATTER:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_SERIES_LIMIT
            };
        case VisualizationTypes.PIE:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.FUNNEL:
            return {
                series: 1,
                categories: PIE_CHART_LIMIT
            };
        case VisualizationTypes.TREEMAP:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_DATA_POINTS_LIMIT,
                dataPoints: DEFAULT_DATA_POINTS_LIMIT
            };
        case VisualizationTypes.HEATMAP:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_CATEGORIES_LIMIT,
                dataPoints: HEATMAP_DATA_POINTS_LIMIT
            };
        default:
            return {
                series: DEFAULT_SERIES_LIMIT,
                categories: DEFAULT_CATEGORIES_LIMIT
            };
    }
}

export function cannotShowNegativeValues(type: string) {
    return isOneOfTypes(type, unsupportedNegativeValuesTypes);
}

function getTreemapDataForValidation(data: any) {
    // filter out root nodes
    return {
        ...data,
        series: data.series.map((serie: any) => ({
            ...serie,
            data: serie.data.filter((dataItem: any) => dataItem.id === undefined)
        }))
    };
}

export function validateData(limits: IChartLimits, chartOptions: any) {
    const { type } = chartOptions;
    const finalLimits = limits || getChartLimits(type);
    let dataToValidate = chartOptions.data;
    if (isTreemap(type)) {
        dataToValidate = getTreemapDataForValidation(chartOptions.data);
    }

    return {
        dataTooLarge: !isDataOfReasonableSize(dataToValidate, finalLimits),
        hasNegativeValue: cannotShowNegativeValues(type)
            && isNegativeValueIncluded(chartOptions.data.series)
    };
}

export function isDerivedMeasure(measureItem: Execution.IMeasureHeaderItem, afm: AFM.IAfm) {
    return afm.measures.some((measure: AFM.IMeasure) => {
        const measureDefinition = get(measure, 'definition.popMeasure')
            || get(measure, 'definition.previousPeriodMeasure');
        const derivedMeasureIdentifier = measureDefinition ? measure.localIdentifier : null;
        return derivedMeasureIdentifier && derivedMeasureIdentifier === measureItem.measureHeaderItem.localIdentifier;
    });
}

function findMeasureIndex(afm: AFM.IAfm, measureIdentifier: string): number {
    return afm.measures.findIndex(
        (measure: AFM.IMeasure) => measure.localIdentifier === measureIdentifier
    );
}

export function findParentMeasureIndex(afm: AFM.IAfm, measureItemIndex: number): number {
    const measureDefinition = afm.measures[measureItemIndex].definition;

    if (AFM.isPopMeasureDefinition(measureDefinition)) {
        const sourceMeasureIdentifier = measureDefinition.popMeasure.measureIdentifier;
        return findMeasureIndex(afm, sourceMeasureIdentifier);
    }
    if (AFM.isPreviousPeriodMeasureDefinition(measureDefinition)) {
        const sourceMeasureIdentifier = measureDefinition.previousPeriodMeasure.measureIdentifier;
        return findMeasureIndex(afm, sourceMeasureIdentifier);
    }

    return -1;
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
    id?: string;
    parent?: string;
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
    id?: string;
    parent?: string;
}

export function getSeriesItemData(
    seriesItem: string[],
    seriesIndex: number,
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    viewByAttribute: any,
    stackByAttribute: any,
    type: string,
    colorStrategy: IColorStrategy
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
        } else if (isOneOfTypes(type, multiMeasuresAlternatingTypes) && !viewByAttribute) {
            measureIndex = pointIndex;
        }

        let valueProp: any = {
            y: parseValue(pointValue)
        };
        if (isTreemap(type)) {
            valueProp = {
                value: parseValue(pointValue)
            };
        }

        const pointData: IPointData = {
            ...valueProp,
            format: unwrap(measureGroup.items[measureIndex]).format,
            marker: {
                enabled: pointValue !== null
            }
        };
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

export interface ISeriesItemConfig {
    color: string;
    legendIndex: number;
    data?: any;
    name?: string;
    yAxis?: number;
    xAxis?: number;
}

export function getHeatmapSeries(
    executionResultData: Execution.DataValue[][],
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader']
) {
    const data = [] as any;
    executionResultData.forEach((rowItem: any, rowItemIndex: number) => {
        rowItem.forEach((columnItem: any, columnItemIndex: number) => {
            data.push({ x: columnItemIndex, y: rowItemIndex, value: parseValue(columnItem) });
        });
    });

    return [{
        name: measureGroup.items[0].measureHeaderItem.name,
        data,
        turboThreshold: 0,
        yAxis: 0,
        dataLabels: {
            formatGD: unwrap(measureGroup.items[0]).format
        },
        legendIndex: 0
    }];
}

function isBucketEmpty(mdObject: VisualizationObject.IVisualizationObjectContent, bucketName: string) {
    const bucket = get(mdObject, 'buckets', [])
        .find(bucket => bucket.localIdentifier === bucketName);

    const bucketItems = get(bucket, 'items', []);
    return isEmpty(bucketItems);
}

export function getScatterPlotSeries(
    executionResultData: Execution.DataValue[][],
    stackByAttribute: any,
    mdObject: VisualizationObject.IVisualizationObjectContent,
    colorStrategy: IColorStrategy
) {
    const primaryMeasuresBucketEmpty = isBucketEmpty(mdObject, MEASURES);
    const secondaryMeasuresBucketEmpty = isBucketEmpty(mdObject, SECONDARY_MEASURES);

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

    return [{
        turboThreshold: 0,
        color: colorStrategy.getColorByIndex(0),
        legendIndex: 0,
        data
    }];
}

function getCountOfEmptyBuckets(bucketEmptyFlags: boolean[] = []) {
    return bucketEmptyFlags.filter(bucketEmpyFlag => bucketEmpyFlag).length;
}

export function getBubbleChartSeries(
    executionResultData: Execution.DataValue[][],
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    stackByAttribute: any,
    mdObject: VisualizationObject.IVisualizationObjectContent,
    colorStrategy: IColorStrategy
) {
    const primaryMeasuresBucket = get(mdObject, ['buckets'], [])
        .find(bucket => bucket.localIdentifier === MEASURES);
    const secondaryMeasuresBucket = get(mdObject, ['buckets'], [])
        .find(bucket => bucket.localIdentifier === SECONDARY_MEASURES);

    const primaryMeasuresBucketEmpty = isEmpty(get(primaryMeasuresBucket, 'items', []));
    const secondaryMeasuresBucketEmpty = isEmpty(get(secondaryMeasuresBucket, 'items', []));

    return executionResultData.map((resData: any, index: number) => {
        let data: any = [];
        if (resData[0] !== null && resData[1] !== null && resData[2] !== null) {
            const emptyBucketsCount = getCountOfEmptyBuckets(
                [primaryMeasuresBucketEmpty, secondaryMeasuresBucketEmpty]
            );
            data = [{
                x: !primaryMeasuresBucketEmpty ? parseValue(resData[0]) : 0,
                y: !secondaryMeasuresBucketEmpty ? parseValue(resData[1 - emptyBucketsCount]) : 0,
                // we want to allow NaN on z to be able show bubble of default size when Size bucket is empty
                z: parseFloat(resData[2 - emptyBucketsCount]),
                format: unwrap(last(measureGroup.items)).format // only for dataLabel format
            }];
        }
        return {
            name: stackByAttribute ? stackByAttribute.items[index].attributeHeaderItem.name : '',
            color: colorStrategy.getColorByIndex(index),
            legendIndex: index,
            data
        };
    });
}

function getColorStep(valuesCount: number): number {
    const MAX_COLOR_BRIGHTNESS = 0.8;
    return MAX_COLOR_BRIGHTNESS / valuesCount;

}

function gradientPreviousGroup(solidColorLeafs: any[]): any[] {
    const colorChange = getColorStep(solidColorLeafs.length);
    return solidColorLeafs.map((leaf: any, index: number) =>
        ({
            ...leaf,
            color: getLighterColor(leaf.color, (colorChange * index))
        })
    );
}

function getRootPoint(
    rootName: string,
    index: number,
    format: string,
    colorStrategy: IColorStrategy
) {
    return {
        id: `${index}`,
        name: rootName,
        color: colorStrategy.getColorByIndex(index),
        showInLegend: true,
        legendIndex: index,
        format
    };
}

function getLeafPoint(
    stackByAttribute: any,
    parentIndex: number,
    seriesIndex: number,
    data: any,
    format: string,
    colorStrategy: IColorStrategy
) {
    return {
        name: stackByAttribute.items[seriesIndex].attributeHeaderItem.name,
        parent: `${parentIndex}`,
        value: parseValue(data),
        x: seriesIndex,
        y: seriesIndex,
        showInLegend: false,
        color: colorStrategy.getColorByIndex(parentIndex),
        format
    };
}

function isLastSerie(seriesIndex: number, dataLength: number) {
    return seriesIndex === (dataLength - 1);
}

export function getTreemapStackedSeriesDataWithViewBy(
    executionResultData: Execution.DataValue[][],
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    viewByAttribute: any,
    stackByAttribute: any,
    colorStrategy: IColorStrategy
): any[] {
    const roots: any = [];
    const leafs: any = [];
    let rootId = -1;
    let uncoloredLeafs: any = [];
    let lastRoot: Execution.IResultAttributeHeaderItem['attributeHeaderItem'] = null;

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
            const lastRootName: string =
                get<Execution.IResultAttributeHeaderItem['attributeHeaderItem'], string>(lastRoot, 'name');
            roots.push(getRootPoint(lastRootName, rootId, format, colorStrategy));
        }
        // create leafs which will be colored at the end of group
        uncoloredLeafs.push(
            getLeafPoint(stackByAttribute, rootId, seriesIndex, seriesItems[0], format, colorStrategy)
        );

        if (isLastSerie(seriesIndex, dataLength)) {
            // store last group leafs
            leafs.push(...gradientPreviousGroup(uncoloredLeafs));
        }
    });

    return [...roots, ...leafs]; // roots need to be first items in data to keep legend working
}

export function getTreemapStackedSeriesDataWithMeasures(
    executionResultData: Execution.DataValue[][],
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    stackByAttribute: any,
    colorStrategy: IColorStrategy
): any[] {
    let data: any = [];

    measureGroup.items.reduce((data: any[], measureGroupItem: any, index: number) => {
        data.push({
            id: `${index}`,
            name: measureGroupItem.measureHeaderItem.name,
            format: measureGroupItem.measureHeaderItem.format,
            color: colorStrategy.getColorByIndex(index),
            showInLegend: true,
            legendIndex: index
        });
        return data;
    }, data);

    executionResultData.forEach((seriesItems: string[], seriesIndex: number) => {
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
                showInLegend: false
            });
        });
        const sortedLeafs = unsortedLeafs.sort((a: IPoint, b: IPoint) => b.value - a.value);

        data = [...data, ...sortedLeafs.map((leaf: IPoint, seriesItemIndex: number) => ({
            ...leaf,
            color: getLighterColor(colorStrategy.getColorByIndex(seriesIndex), (colorChange * seriesItemIndex))
        }))];
    });

    return data;
}

export function getTreemapStackedSeries(
    executionResultData: Execution.DataValue[][],
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    viewByAttribute: any,
    stackByAttribute: any,
    colorStrategy: IColorStrategy
) {
    let data = [];
    if (viewByAttribute) {
        data = getTreemapStackedSeriesDataWithViewBy(
            executionResultData,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            colorStrategy
        );
    } else {
        data = getTreemapStackedSeriesDataWithMeasures(
            executionResultData,
            measureGroup,
            stackByAttribute,
            colorStrategy
        );
    }

    const seriesName = measureGroup.items.map((wrappedMeasure: Execution.IMeasureHeaderItem) => {
        return unwrap(wrappedMeasure).name;
    }).join(', ');

    return [{
        name: seriesName,
        legendType: 'point',
        showInLegend: true,
        data,
        turboThreshold: 0
    }];
}

export function getSeries(
    executionResultData: Execution.DataValue[][],
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    viewByAttribute: any,
    stackByAttribute: any,
    type: string,
    mdObject: VisualizationObject.IVisualizationObjectContent,
    colorStrategy: IColorStrategy
): any {
    if (isHeatmap(type)) {
        return getHeatmapSeries(executionResultData, measureGroup);
    } else if (isScatterPlot(type)) {
        return getScatterPlotSeries(executionResultData, stackByAttribute, mdObject, colorStrategy);
    } else if (isBubbleChart(type)) {
        return getBubbleChartSeries(executionResultData, measureGroup, stackByAttribute, mdObject, colorStrategy);
    } else if (isTreemap(type) && stackByAttribute) {
        return getTreemapStackedSeries(
            executionResultData,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            colorStrategy
        );
    }

    return executionResultData.map((seriesItem: string[], seriesIndex: number) => {
        const seriesItemData = getSeriesItemData(
            seriesItem,
            seriesIndex,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            type,
            colorStrategy
        );

        const seriesItemConfig: ISeriesItemConfig = {
            color: colorStrategy.getColorByIndex(seriesIndex),
            legendIndex: seriesIndex,
            data: seriesItemData
        };

        if (stackByAttribute) {
            // if stackBy attribute is available, seriesName is a stackBy attribute value of index seriesIndex
            // this is a limitiation of highcharts and a reason why you can not have multi-measure stacked charts
            seriesItemConfig.name = stackByAttribute.items[seriesIndex].attributeHeaderItem.name;
        } else if (isOneOfTypes(type, multiMeasuresAlternatingTypes) && !viewByAttribute) {
            // Pie charts with measures only have a single series which name would is ambiguous
            seriesItemConfig.name = measureGroup.items.map((wrappedMeasure: Execution.IMeasureHeaderItem) => {
                return unwrap(wrappedMeasure).name;
            }).join(', ');
        } else {
            // otherwise seriesName is a measure name of index seriesIndex
            seriesItemConfig.name = measureGroup.items[seriesIndex].measureHeaderItem.name;
        }

        const turboThresholdProp = isTreemap(type) ? { turboThreshold: 0 } : {};

        return {
            ...seriesItemConfig,
            ...turboThresholdProp
        };
    });
}

export const customEscape = (str: string) => str && escape(unescape(str));

export function generateTooltipFn(viewByAttribute: any, type: string, config: IChartConfig = {}) {
    const { separators } = config;
    const formatValue = (val: number, format: string) => {
        return colors2Object(numberFormat(val, format, undefined, separators));
    };

    return (point: IPoint) => {
        const formattedValue = customEscape(formatValue(point.y, point.format).label);
        const textData = [[customEscape(point.series.name), formattedValue]];

        if (viewByAttribute) {
            // For some reason, highcharts ommit categories for pie charts with attribute. Use point.name instead.
            // use attribute name instead of attribute display form name
            textData.unshift([customEscape(viewByAttribute.formOf.name), customEscape(point.category || point.name)]);
        } else if (isOneOfTypes(type, multiMeasuresAlternatingTypes)) {
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

export function generateTooltipXYFn(measures: any, stackByAttribute: any, config: IChartConfig = {}) {
    const { separators } = config;
    const formatValue = (val: number, format: string) => {
        return colors2Object(numberFormat(val, format, undefined, separators));
    };

    return (point: IPoint) => {
        const textData = [];
        const name = point.name ? point.name : point.series.name;

        if (stackByAttribute) {
            textData.unshift([customEscape(stackByAttribute.formOf.name), customEscape(name)]);
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

export function generateTooltipHeatmapFn(viewByAttribute: any, stackByAttribute: any, config: IChartConfig = {}) {
    const { separators } = config;
    const formatValue = (val: number, format: string) => {
        return colors2Object(val === null ? '-' : numberFormat(val, format, undefined, separators));
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

export function generateTooltipTreemapFn(viewByAttribute: any, stackByAttribute: any, config: IChartConfig = {}) {
    const { separators } = config;
    const formatValue = (val: number, format: string) => {
        return colors2Object(numberFormat(val, format, undefined, separators));
    };

    return (point: IPoint) => {
        if (point.id !== undefined) { // no tooltip for root points
            return null;
        }
        const formattedValue = customEscape(formatValue(point.value, point.format).label);

        const textData = [];

        if (stackByAttribute) {
            textData.push([
                customEscape(stackByAttribute.formOf.name),
                customEscape(stackByAttribute.items[point.y].attributeHeaderItem.name)
            ]);
        }

        if (viewByAttribute) {
            textData.unshift([
                customEscape(viewByAttribute.formOf.name),
                customEscape(viewByAttribute.items[point.x].attributeHeaderItem.name)
            ]);
            textData.push([customEscape(point.series.name), formattedValue]);
        } else {
            textData.push([customEscape(point.category), formattedValue]);
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
         _dimensionIndex: number, headerIndex: number, headerCount: number) => {
            const measureGroupHeader = headerType === 'measureGroupHeader' ? header : null;
            if (measureGroupHeader) {
                invariant(headerIndex === headerCount - 1, 'MeasureGroup must be the last header in it\'s dimension');
            }
            return measureGroupHeader;
        });
}

export function findAttributeInDimension(
    dimension: any,
    attributeHeaderItemsDimension: any,
    indexInDimension?: number
) {
    return findInDimensionHeaders(
        [dimension],
        (headerType: any, header: any, _dimensionIndex: number, headerIndex: number) => {
            if (headerType === 'attributeHeader'
                && (indexInDimension === undefined || indexInDimension === headerIndex)) {
                return {
                    ...header,
                    // attribute items are delivered separately from attributeHeaderItems
                    items: attributeHeaderItemsDimension[indexInDimension ? indexInDimension : 0]
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
    type: VisType,
    afm: AFM.IAfm
) {
    const isMultiMeasureWithOnlyMeasures = isOneOfTypes(type, multiMeasuresAlternatingTypes) && !viewByAttribute;

    return series.map((seriesItem: any, seriesIndex: number) => {
        let isSeriesDrillable = false;
        let data = seriesItem.data && seriesItem.data.map((pointData: IPointData, pointIndex: number) => {
            let measures = [];

            const isStackedTreemap = isTreemap(type) && !!stackByAttribute;
            if (isScatterPlot(type)) {
                measures = get(measureGroup, 'items', []).slice(0, 2).map(unwrap);
            } else if (isBubbleChart(type)) {
                measures = get(measureGroup, 'items', []).slice(0, 3).map(unwrap);
            } else if (isStackedTreemap) {
                if (pointData.id !== undefined) { // not leaf -> can't be drillable
                    return pointData;
                }
                let measureIndex = 0;
                if (!viewByAttribute) {
                    measureIndex = parseInt(pointData.parent, 10);
                }
                measures = [unwrap(measureGroup.items[measureIndex])];
            } else {
                // measureIndex is usually seriesIndex,
                // except for stack by attribute and metricOnly pie or donut chart
                // it is looped-around pointIndex instead
                // Looping around the end of items array only works when
                // measureGroup is the last header on it's dimension
                // We do not support setups with measureGroup before attributeHeaders
                const measureIndex = !stackByAttribute && !isMultiMeasureWithOnlyMeasures
                    ? seriesIndex : pointIndex % measureGroup.items.length;

                measures = [unwrap(measureGroup.items[measureIndex])];
            }

            const viewByIndex = isHeatmap(type) || isStackedTreemap ? pointData.x : pointIndex;
            let stackByIndex = isHeatmap(type) || isStackedTreemap ? pointData.y : seriesIndex;
            if (isScatterPlot(type)) {
                stackByIndex = viewByIndex; // scatter plot uses stack by attribute but has only one serie
            }

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

        if (isScatterPlot(type)) {
            data = data.filter((dataItem: ISeriesDataItem) => {
                return dataItem.x !== null && dataItem.y !== null;
            });
        }

        return {
            ...seriesItem,
            data,
            isDrillable: isSeriesDrillable
        };
    });
}

function getCategories(
    type: string,
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    viewByAttribute: any, stackByAttribute: any
    ) {
    if (isHeatmap(type)) {
        return [
            viewByAttribute ? viewByAttribute.items.map((item: any) => item.attributeHeaderItem.name) : [''],
            stackByAttribute ? stackByAttribute.items.map((item: any) => item.attributeHeaderItem.name) : ['']
        ];
    }
    if (isScatterPlot(type)) {
        return stackByAttribute ? stackByAttribute.items.map((item: any) => item.attributeHeaderItem.name) : [''];
    }

    // Categories make up bar/slice labels in charts. These usually match view by attribute values.
    // Measure only pie or treemap charts get categories from measure names
    if (viewByAttribute) {
        return viewByAttribute.items.map(({ attributeHeaderItem }: any) => attributeHeaderItem.name);
    }

    if (isOneOfTypes(type, multiMeasuresAlternatingTypes)) {
        // Pie or Treemap chart with measures only (no viewByAttribute) needs to list
        return measureGroup.items.map((wrappedMeasure: Execution.IMeasureHeaderItem) => unwrap(wrappedMeasure).name);
        // Pie chart categories are later sorted by seriesItem pointValue
    }
    return [];
}

function getStackingConfig(stackByAttribute: any, options: any) {
    const stackingValue = 'normal';
    const { type, stacking } = options;

    const supportsStacking = !(isOneOfTypes(type, unsupportedStackingTypes));

    /**
     * we should enable stacking for one of the following cases :
     * 1) If stackby attibute have been set and chart supports stacking
     * 2) If chart is an area chart and stacking is enabled (stackBy attribute doesn't matter)
     */
    const isStackByChart = stackByAttribute && supportsStacking;
    const isAreaChartWithEnabledStacking = isAreaChart(type) && enableAreaChartStacking(stacking);
    if (isStackByChart || isAreaChartWithEnabledStacking) {
        return stackingValue;
    }

    // No stacking
    return null;
}

function preprocessMeasureGroupItems(
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    defaultValues: any
    ): any[] {
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

function getXAxes(
    config: IChartConfig,
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    viewByAttribute: any
    ): IAxis[] {
    const { type, mdObject } = config;
    const measureGroupItems = preprocessMeasureGroupItems(measureGroup,
        { label: config.xLabel, format: config.xFormat });

    const firstMeasureGroupItem = measureGroupItems[0];

    if (isScatterPlot(type) || isBubbleChart(type)) {
        const noPrimaryMeasures = isBucketEmpty(mdObject, MEASURES);
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

function getMeasureFormatKey(measureGroupItems: Execution.IMeasureHeaderItem[]) {
    const percentageFormat = getMeasureFormat(measureGroupItems.find((measure: any) => {
        return isPercentage(getMeasureFormat(measure));
    }));
    return percentageFormat !== '' ? {
        format: percentageFormat
    } : {};
}

function getMeasureFormat(measure: any) {
    return get(measure, 'format', '');
}

function isPercentage(format: string) {
    return format.includes('%');
}

function getYAxes(
    config: IChartConfig,
    measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'],
    stackByAttribute: any
    ): IAxis[] {
    const { type, mdObject } = config;

    const measureGroupItems = preprocessMeasureGroupItems(measureGroup,
        { label: config.yLabel, format: config.yFormat });

    const firstMeasureGroupItem = measureGroupItems[0];
    const secondMeasureGroupItem = measureGroupItems[1];
    const hasMoreThanOneMeasure = measureGroupItems.length > 1;
    const noPrimaryMeasures = isBucketEmpty(mdObject, MEASURES);

    const { measures : secondaryAxisMeasures = [] as string[] } =
        (isBarChart(type) ? config.secondary_xaxis : config.secondary_yaxis) || {};

    let yAxes: IAxis[] = [];

    if (isScatterPlot(type) || isBubbleChart(type)) {
        const hasSecondaryMeasure = get(mdObject, 'buckets', [])
            .find(m => m.localIdentifier === SECONDARY_MEASURES && m.items.length > 0);

        if (hasSecondaryMeasure) {
            if (noPrimaryMeasures) {
                yAxes = [{
                    ...firstMeasureGroupItem
                }];
            } else {
                yAxes = [{
                    ...secondMeasureGroupItem
                }];
            }
        } else {
            yAxes = [{ label: '' }];
        }
    } else if (isHeatmap(type)) {
        yAxes = [{
            label: stackByAttribute ? stackByAttribute.formOf.name : ''
        }];
    } else if (isOneOfTypes(type, supportedDualAxesChartTypes) &&
                !isEmpty(measureGroupItems) &&
                !isEmpty(secondaryAxisMeasures)) {

        const {
            measuresInFirstAxis,
            measuresInSecondAxis }: IMeasuresInAxes = assignMeasuresToAxes(secondaryAxisMeasures, measureGroup);

        let firstAxis: IAxis = createYAxisItem(measuresInFirstAxis, false);
        let secondAxis: IAxis = createYAxisItem(measuresInSecondAxis, true);

        if (firstAxis) {
            firstAxis = {
                ...firstAxis,
                ...getMeasureFormatKey(measuresInFirstAxis),
                seriesIndices: measuresInFirstAxis.map(({ index }: any) => index)
            };
        }
        if (secondAxis) {
            secondAxis = {
                ...secondAxis,
                ...getMeasureFormatKey(measuresInSecondAxis),
                seriesIndices: measuresInSecondAxis.map(({ index }: any) => index)
            };
        }

        yAxes = compact([firstAxis, secondAxis]);
    } else {
        // if more than one measure and NOT dual, then have empty item name
        const nonDualMeasureAxis = hasMoreThanOneMeasure ? {
            label: ''
        } : {};
        yAxes = [{
            ...firstMeasureGroupItem,
            ...nonDualMeasureAxis,
            seriesIndices: range(measureGroupItems.length),
            ...getMeasureFormatKey(measureGroupItems)
        }];
    }

    return yAxes;
}

interface IMeasuresInAxes {
    measuresInFirstAxis: any[];
    measuresInSecondAxis: any[];
}

function assignMeasuresToAxes(secondMeasures: string[],
                              measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader']): IMeasuresInAxes {
    return measureGroup.items
        .reduce((result: any,
                 { measureHeaderItem: { name, format, localIdentifier } }: Execution.IMeasureHeaderItem,
                 index) => {

            if (includes(secondMeasures, localIdentifier)) {
                result.measuresInSecondAxis.push({ name, format, index });
            } else {
                result.measuresInFirstAxis.push({ name, format, index });
            }
            return result;
        }, {
            measuresInFirstAxis: [],
            measuresInSecondAxis: []
        });
}

function createYAxisItem(measuresInAxis: any[], opposite = false) {
    const length = measuresInAxis.length;
    if (length) {
        const { name, format } = measuresInAxis[0];
        return  {
            label: length === 1 ? name : '',
            format,
            opposite
        };
    }
    return null;
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

export const HEAT_MAP_CATEGORIES_COUNT = 7;
export const HIGHCHARTS_PRECISION = 15;
export const DEFAULT_HEATMAP_COLOR_INDEX = 1;

export function getHeatmapDataClasses(
    series: any = [],
    colorStrategy: IColorStrategy
    ): Highcharts.ColorAxisDataClass[] {
    const values: number[] = without(get(series, '0.data', []).map((item: any) => item.value), null, undefined, NaN);

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
            color: colorStrategy.getColorByIndex(DEFAULT_HEATMAP_COLOR_INDEX)
        });
    } else {
        const step = (safeMax - safeMin) / HEAT_MAP_CATEGORIES_COUNT;
        let currentSum = safeMin;
        for (let i = 0; i < HEAT_MAP_CATEGORIES_COUNT; i += 1) {
            dataClasses.push({
                from: currentSum,
                to: i === HEAT_MAP_CATEGORIES_COUNT - 1 ? safeMax : currentSum + step,
                color: colorStrategy.getColorByIndex(i)
            });
            currentSum += step;
        }
    }

    return dataClasses;
}

export function getDefaultTreemapAttributes(
    dimensions: Execution.IResultDimension[],
    attributeHeaderItems: Execution.IResultHeaderItem[][][]
): any {
    let viewByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        attributeHeaderItems[STACK_BY_DIMENSION_INDEX]
    );
    const stackByAttribute = findAttributeInDimension(
        dimensions[STACK_BY_DIMENSION_INDEX],
        attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
        1
    );
    if (!viewByAttribute) {
        viewByAttribute = findAttributeInDimension(
            dimensions[VIEW_BY_DIMENSION_INDEX],
            attributeHeaderItems[VIEW_BY_DIMENSION_INDEX]
        );
    }
    return {
        viewByAttribute,
        stackByAttribute
    };
}

export function getTreemapAttributes(
    dimensions: Execution.IResultDimension[],
    attributeHeaderItems: Execution.IResultHeaderItem[][][],
    mdObject: VisualizationObject.IVisualizationObjectContent
): any {
    if (!mdObject) { // without mdObject cant distinguish 1M 1Vb 0Sb and 1M 0Vb 1Sb
        return getDefaultTreemapAttributes(dimensions, attributeHeaderItems);
    }
    if (isBucketEmpty(mdObject, SEGMENT)) {
        if (isBucketEmpty(mdObject, VIEW)) {
            return {
                viewByAttribute: null,
                stackByAttribute: null
            };
        }
        return {
            viewByAttribute: findAttributeInDimension(
                dimensions[VIEW_BY_DIMENSION_INDEX],
                attributeHeaderItems[VIEW_BY_DIMENSION_INDEX]
            ),
            stackByAttribute: null
        };
    }
    if (isBucketEmpty(mdObject, VIEW)) {
        return {
            viewByAttribute: null,
            stackByAttribute: findAttributeInDimension(
                dimensions[VIEW_BY_DIMENSION_INDEX],
                attributeHeaderItems[VIEW_BY_DIMENSION_INDEX]
            )
        };
    }
    return {
        viewByAttribute: findAttributeInDimension(
            dimensions[STACK_BY_DIMENSION_INDEX],
            attributeHeaderItems[STACK_BY_DIMENSION_INDEX]
        ),
        stackByAttribute: findAttributeInDimension(
            dimensions[STACK_BY_DIMENSION_INDEX],
            attributeHeaderItems[STACK_BY_DIMENSION_INDEX],
            1
        )
    };
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
    _resultSpec: AFM.IResultSpec,
    dimensions: Execution.IResultDimension[],
    executionResultData: Execution.DataValue[][],
    unfilteredHeaderItems: Execution.IResultHeaderItem[][][],
    config: IChartConfig,
    drillableItems: IDrillableItem[]
): IChartOptions {
    // Future version of API will return measures alongside attributeHeaderItems
    // we need to filter these out in order to stay compatible
    const attributeHeaderItems = unfilteredHeaderItems.map((dimension: Execution.IResultHeaderItem[][]) => {
        return dimension.filter((attributeHeaders: any) => attributeHeaders[0].attributeHeaderItem);
    });

    invariant(config && isChartSupported(config.type),
        `config.type must be defined and match one of supported chart types: ${stringifyChartTypes()}`);

    const { type, mdObject } = config;
    const measureGroup: Execution.IMeasureGroupHeader['measureGroupHeader'] = findMeasureGroupInDimensions(dimensions);
    let viewByAttribute;
    let stackByAttribute;

    if (isTreemap(type)) {
        const {
            viewByAttribute: treemapViewByAttribute,
            stackByAttribute: treemapStackByAttribute
        } = getTreemapAttributes(
            dimensions,
            attributeHeaderItems,
            mdObject
        );
        viewByAttribute = treemapViewByAttribute;
        stackByAttribute = treemapStackByAttribute;
    } else {
        viewByAttribute = findAttributeInDimension(
            dimensions[VIEW_BY_DIMENSION_INDEX],
            attributeHeaderItems[VIEW_BY_DIMENSION_INDEX]
        );
        stackByAttribute = findAttributeInDimension(
            dimensions[STACK_BY_DIMENSION_INDEX],
            attributeHeaderItems[STACK_BY_DIMENSION_INDEX]
        );
    }

    invariant(measureGroup, 'missing measureGroup');

    const colorStrategy = ColorFactory.getColorStrategy(
        config.colorPalette,
        config.colorMapping,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        afm,
        type
    );

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
        colorStrategy
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
    if (isOneOfTypes(type, sortedByMeasureTypes)) {
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
                color: get(dataPoints[dataPointIndex], 'color'),
                legendIndex: dataPointIndex
            };
        });
        // categories need to be sorted in exactly the same order as dataPoints
        categories = categories.map((_category: any, dataPointIndex: number) =>
            categories[indexSortOrder[dataPointIndex]]);
        series[0].data = sortedDataPoints;
    }

    const colorAssignments = colorStrategy.getColorAssignment();
    const { colorPalette } = config;

    if (isComboChart(type)) {
        return {
            type,
            stacking,
            xAxes,
            yAxes,
            legendLayout: config.legendLayout || 'horizontal',
            dualAxis: false,
            actions: {
                tooltip: generateTooltipFn(viewByAttribute, type, config)
            },
            grid: {
                enabled: gridEnabled
            },
            ...getComboChartOptions(
                config,
                measureGroup,
                series,
                categories
            ),
            colorAssignments,
            colorPalette
        };
    }

    if (isScatterPlot(type)) {
        const { xAxisProps, yAxisProps } = getChartProperties(config, type);

        let measures = [
            measureGroup.items[0] ? measureGroup.items[0] : null,
            measureGroup.items[1] ? measureGroup.items[1] : null
        ];
        if (isBucketEmpty(mdObject, MEASURES)) {
            measures = [
                null,
                measureGroup.items[0] ? measureGroup.items[0] : null
            ];
        }

        return {
            type,
            stacking,
            legendLayout: 'horizontal',
            yAxes,
            xAxes,
            data: {
                series,
                categories
            },
            actions: {
                tooltip: generateTooltipXYFn(measures, stackByAttribute, config)
            },
            grid: {
                enabled: gridEnabled
            },
            xAxisProps,
            yAxisProps,
            colorAssignments,
            colorPalette
        };
    }

    if (isHeatmap(type)) {
        const { xAxisProps, yAxisProps } = getChartProperties(config, type);
        return {
            type,
            stacking: null,
            legendLayout: 'horizontal',
            title: {
                x: (viewByAttribute ? viewByAttribute.name : ''),
                y: (stackByAttribute ? stackByAttribute.name : ''),
                format: unwrap(measureGroup.items[0]).format
            },
            xAxes,
            yAxes,
            data: {
                series,
                categories
            },
            actions: {
                tooltip: generateTooltipHeatmapFn(viewByAttribute, stackByAttribute, config)
            },
            grid: {
                enabled: false
            },
            colorAxis: {
                dataClasses: getHeatmapDataClasses(series, colorStrategy)
            },
            xAxisProps,
            yAxisProps,
            colorAssignments,
            colorPalette
        };
    }

    if (isBubbleChart(type)) {
        const measures: Execution.IMeasureHeaderItem[] = [];
        const measureGroupCopy = cloneDeep(measureGroup);
        const { xAxisProps, yAxisProps } = getChartProperties(config, type);

        if (!isBucketEmpty(mdObject, MEASURES)) {
            measures.push(measureGroup.items[0] ? measureGroupCopy.items.shift() : null);
        } else {
            measures.push(null);
        }

        if (!isBucketEmpty(mdObject, SECONDARY_MEASURES)) {
            measures.push(measureGroup.items[0] ? measureGroupCopy.items.shift() : null);
        } else {
            measures.push(null);
        }

        if (!isBucketEmpty(mdObject, TERTIARY_MEASURES)) {
            measures.push(measureGroup.items[0] ? measureGroupCopy.items.shift() : null);
        } else {
            measures.push(null);
        }

        return {
            type,
            stacking,
            hasViewByAttribute: Boolean(stackByAttribute),
            legendLayout: 'horizontal',
            yAxes,
            xAxes,
            data: {
                series,
                categories: ['']
            },
            actions: {
                tooltip: generateTooltipXYFn(measures, stackByAttribute, config)
            },
            grid: {
                enabled: gridEnabled
            },
            xAxisProps,
            yAxisProps,
            colorAssignments,
            colorPalette
        };
    }

    const { xAxisProps, yAxisProps, secondary_xAxisProps, secondary_yAxisProps } = getChartProperties(config, type);

    const tooltipFn = isTreemap(type) ? generateTooltipTreemapFn(viewByAttribute, stackByAttribute, config) :
        generateTooltipFn(viewByAttribute, type, config);

    const chartOptions = {
        type,
        stacking,
        hasStackByAttribute: Boolean(stackByAttribute),
        hasViewByAttribute: Boolean(viewByAttribute),
        legendLayout: config.legendLayout || 'horizontal',
        xAxes,
        yAxes,
        data: {
            series,
            categories
        },
        actions: {
            tooltip: tooltipFn
        },
        grid: {
            enabled: gridEnabled
        },
        xAxisProps,
        yAxisProps,
        secondary_xAxisProps,
        secondary_yAxisProps,
        colorAssignments,
        colorPalette
    };

    return chartOptions;
}
