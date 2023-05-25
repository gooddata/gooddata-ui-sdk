// (C) 2007-2022 GoodData Corporation
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";
import { IChartConfig } from "../../../interfaces/index.js";
import { IMeasureDescriptor, IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { IAxis, ISeriesItem } from "../../typings/unsafe.js";
import {
    isBarChart,
    isBubbleChart,
    isHeatmap,
    isOneOfTypes,
    isScatterPlot,
    unwrap,
    isSupportingJoinedAttributeAxisName,
} from "../_util/common.js";
import { supportedDualAxesChartTypes } from "./chartCapabilities.js";
import isEmpty from "lodash/isEmpty.js";
import compact from "lodash/compact.js";
import findIndex from "lodash/findIndex.js";
import range from "lodash/range.js";
import includes from "lodash/includes.js";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";

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
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems,
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
    return [
        {
            label: xLabel,
        },
    ];
}

export function getYAxes(
    dv: DataViewFacade,
    config: IChartConfig,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
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
                seriesIndices: measuresInFirstAxis.map(({ index }: any) => index),
            };
        }
        if (secondAxis) {
            secondAxis = {
                ...secondAxis,
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
            },
        ];
    }

    return yAxes;
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

export function assignYAxes(series: ISeriesItem[], yAxes: IAxis[]): ISeriesItem[] {
    return series.reduce((result, item, index) => {
        const yAxisIndex = findIndex(yAxes, (axis: IAxis) => {
            return includes(axis.seriesIndices ?? [], index);
        });
        // for case viewBy and stackBy have one attribute, and one measure is sliced to multiple series
        // then 'yAxis' in other series should follow the first one
        const firstYAxisIndex = result.length > 0 ? result[0].yAxis : 0;
        const seriesItem = {
            ...item,
            yAxis: yAxisIndex !== -1 ? yAxisIndex : firstYAxisIndex,
        };

        result.push(seriesItem);
        return result;
    }, []);
}
