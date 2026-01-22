// (C) 2007-2026 GoodData Corporation

import { compact, isEmpty, range } from "lodash-es";

import { type IMeasureDescriptor, type IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade } from "@gooddata/sdk-ui";

import { supportedDualAxesChartTypes } from "./chartCapabilities.js";
import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { type IAxis, type ISeriesItem } from "../../typings/unsafe.js";
import {
    isBarChart,
    isBubbleChart,
    isHeatmap,
    isOneOfTypes,
    isScatterPlot,
    isSupportingJoinedAttributeAxisName,
    unwrap,
} from "../_util/common.js";

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

export function getXAxes(
    dv: DataViewFacade,
    config: IChartConfig,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    plotLines: number[] | undefined,
): IAxis[] {
    const { type, enableJoinedAttributeAxisName } = config;

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

    if (enableJoinedAttributeAxisName && isSupportingJoinedAttributeAxisName(type)) {
        let xLabel = "";
        if (config.xLabel) {
            xLabel = config.xLabel;
        } else if (viewByAttribute && viewByParentAttribute) {
            xLabel = [viewByParentAttribute.formOf.name, viewByAttribute.formOf.name].join(" \u203a ");
        } else if (viewByAttribute) {
            xLabel = viewByAttribute.formOf.name;
        }
        return [
            {
                label: xLabel,
            },
        ];
    }

    const xLabel = config.xLabel || (viewByAttribute ? viewByAttribute.formOf.name : "");
    const plotLinesProps = plotLines === undefined ? {} : { plotLines };

    return [
        {
            label: xLabel,
            ...plotLinesProps,
        },
    ];
}

function getScatterOrBubbleYAxes(
    dv: DataViewFacade,
    firstMeasureGroupItem: any,
    secondMeasureGroupItem: any,
): IAxis[] {
    const hasSecondaryMeasure = !dv.def().isBucketEmpty(BucketNames.SECONDARY_MEASURES);

    if (!hasSecondaryMeasure) {
        return [{ label: "" }];
    }

    const noPrimaryMeasures = dv.def().isBucketEmpty(BucketNames.MEASURES);
    const measureItem = noPrimaryMeasures ? firstMeasureGroupItem : secondMeasureGroupItem;
    return [{ ...measureItem }];
}

function getHeatmapYAxes(stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null): IAxis[] {
    return [
        {
            label: stackByAttribute ? stackByAttribute.formOf.name : "",
        },
    ];
}

interface IMeasureInAxis {
    name: string;
    format: string;
    index: number;
}
interface IMeasuresInAxes {
    measuresInFirstAxis: IMeasureInAxis[];
    measuresInSecondAxis: IMeasureInAxis[];
}

function addSeriesIndicesToAxis(axis: IAxis | null, measuresInAxis: IMeasureInAxis[]): IAxis | null {
    if (!axis) {
        return null;
    }
    return {
        ...axis,
        seriesIndices: measuresInAxis.map(({ index }) => index),
    };
}

function getDualAxesYAxes(
    secondaryAxisMeasures: string[],
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
): IAxis[] {
    const { measuresInFirstAxis, measuresInSecondAxis }: IMeasuresInAxes = assignMeasuresToAxes(
        secondaryAxisMeasures,
        measureGroup,
    );

    const firstAxis = addSeriesIndicesToAxis(
        createYAxisItem(measuresInFirstAxis, false),
        measuresInFirstAxis,
    );
    const secondAxis = addSeriesIndicesToAxis(
        createYAxisItem(measuresInSecondAxis, true),
        measuresInSecondAxis,
    );

    return compact([firstAxis, secondAxis]);
}

function getDefaultYAxes(measureGroupItems: any[], firstMeasureGroupItem: any): IAxis[] {
    // if more than one measure and NOT dual, then have empty item name
    const hasMoreThanOneMeasure = measureGroupItems.length > 1;
    const nonDualMeasureAxis = hasMoreThanOneMeasure ? { label: "" } : {};
    return [
        {
            ...firstMeasureGroupItem,
            ...nonDualMeasureAxis,
            seriesIndices: range(measureGroupItems.length),
        },
    ];
}

export function getYAxes(
    dv: DataViewFacade,
    config: IChartConfig,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
): IAxis[] {
    const { type } = config;

    const measureGroupItems = preprocessMeasureGroupItems(measureGroup, {
        label: config.yLabel,
        format: config.yFormat,
    });

    const firstMeasureGroupItem = measureGroupItems[0];
    const secondMeasureGroupItem = measureGroupItems[1];

    const { measures: secondaryAxisMeasures = [] as string[] } =
        (isBarChart(type) ? config.secondary_xaxis : config.secondary_yaxis) || {};

    if (isScatterPlot(type) || isBubbleChart(type)) {
        return getScatterOrBubbleYAxes(dv, firstMeasureGroupItem, secondMeasureGroupItem);
    }

    if (isHeatmap(type)) {
        return getHeatmapYAxes(stackByAttribute);
    }

    const isDualAxes =
        isOneOfTypes(type, supportedDualAxesChartTypes) &&
        !isEmpty(measureGroupItems) &&
        !isEmpty(secondaryAxisMeasures);

    if (isDualAxes) {
        return getDualAxesYAxes(secondaryAxisMeasures, measureGroup);
    }

    return getDefaultYAxes(measureGroupItems, firstMeasureGroupItem);
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
            if (secondMeasures.includes(localIdentifier)) {
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

export function assignYAxes(series: ISeriesItem[], yAxes: IAxis[]): ISeriesItem[] {
    return series.reduce<ISeriesItem[]>((result, item, index) => {
        const yAxisIndex = yAxes.findIndex((axis: IAxis) => {
            return (axis.seriesIndices ?? []).includes(index);
        });
        // for case viewBy and stackBy have one attribute, and one measure is sliced to multiple series
        // then 'yAxis' in other series should follow the first one
        const firstYAxisIndex = result.length > 0 ? result[0].yAxis : 0;
        const seriesItem: ISeriesItem = {
            ...item,
            yAxis: yAxisIndex === -1 ? firstYAxisIndex : yAxisIndex,
        };

        result.push(seriesItem);
        return result;
    }, []);
}
