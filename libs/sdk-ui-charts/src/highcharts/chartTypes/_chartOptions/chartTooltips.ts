// (C) 2007-2026 GoodData Corporation

import cx from "classnames";

import { ClientFormatterFacade } from "@gooddata/number-formatter";
import { type IMeasureDescriptor, type ISeparators } from "@gooddata/sdk-model";
import { getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import {
    type IAxis,
    type ICategory,
    type IPointDescriptionFn,
    type ITooltipFactory,
    type IUnsafeHighchartsTooltipPoint,
    type UnsafeInternals,
} from "../../typings/unsafe.js";
import {
    customEscape,
    decodeHtmlEntities,
    isCssMultiLineTruncationSupported,
    isOneOfTypes,
    isTreemap,
    unwrap,
} from "../_util/common.js";

import { multiMeasuresAlternatingTypes } from "./chartCapabilities.js";
import { formatValueForTooltip, getFormattedValueForTooltip } from "./tooltip.js";

const TOOLTIP_PADDING = 10;

const renderTooltipHTML = (textData: (string | undefined)[][], maxTooltipContentWidth: number): string => {
    const maxItemWidth = maxTooltipContentWidth - TOOLTIP_PADDING * 2;
    const titleMaxWidth = maxItemWidth;
    const multiLineTruncationSupported = isCssMultiLineTruncationSupported();
    const threeDotsWidth = 16;
    const valueMaxWidth = multiLineTruncationSupported ? maxItemWidth : maxItemWidth - threeDotsWidth;
    const titleStyle = `style="max-width: ${titleMaxWidth}px;"`;
    const valueStyle = `style="max-width: ${valueMaxWidth}px;"`;
    const itemClass = cx("gd-viz-tooltip-item", {
        "gd-multiline-supported": multiLineTruncationSupported,
    });
    const valueClass = cx("gd-viz-tooltip-value", {
        "gd-clamp-two-line": multiLineTruncationSupported,
    });

    return textData
        .map((item) => {
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

function isPointOnOppositeAxis(point: IUnsafeHighchartsTooltipPoint): boolean {
    return point.series?.yAxis?.opposite ?? false;
}

function getMeasureTextData(measure: IMeasureDescriptor | undefined, formattedValue: string | undefined) {
    if (measure) {
        return [[customEscape(measure.measureHeaderItem.name), formattedValue]];
    }
    return [];
}

function getTextDataWithStackByAttribute(
    measure: IMeasureDescriptor | undefined,
    formattedValue: string | undefined,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    point: IUnsafeHighchartsTooltipPoint,
) {
    const textData = getMeasureTextData(measure, formattedValue);
    textData.unshift([
        customEscape(stackByAttribute.formOf.name),
        customEscape(customEscape(point.series?.name)),
    ]);
    return textData;
}

export function buildTooltipFactory(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    type: string | undefined,
    config: IChartConfig = {},
    isDualAxis: boolean = false,
    measure?: IMeasureDescriptor,
    stackByAttribute?: IUnwrappedAttributeHeadersWithItems | null,
): ITooltipFactory {
    const { separators, stackMeasuresToPercent = false } = config;

    return (
        point: IUnsafeHighchartsTooltipPoint,
        maxTooltipContentWidth: number,
        percentageValue?: number,
    ): string => {
        const isDualChartWithRightAxis = isDualAxis && isPointOnOppositeAxis(point);
        const formattedValue = getFormattedValueForTooltip(
            isDualChartWithRightAxis,
            stackMeasuresToPercent,
            point,
            separators,
            percentageValue,
        );
        let textData = [[customEscape(point.series?.name), formattedValue]];

        if (stackByAttribute) {
            textData = getTextDataWithStackByAttribute(measure, formattedValue, stackByAttribute, point);
        }

        if (viewByAttribute) {
            // For some reason, highcharts ommit categories for pie charts with attribute. Use point.name instead.
            // use attribute name instead of attribute display form name
            textData.unshift([
                customEscape(viewByAttribute.formOf.name),
                // since applying 'grouped-categories' plugin,
                // 'category' type is replaced from string to object in highchart
                customEscape(point.category?.name || point.name),
            ]);
        } else if (isOneOfTypes(type, multiMeasuresAlternatingTypes)) {
            // Pie charts with measure only have to use point.name instead of series.name to get the measure name
            textData[0][0] = customEscape(point.name);
        }
        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function buildTooltipForTwoAttributesFactory(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    config: IChartConfig = {},
    isDualAxis: boolean = false,
    measure?: IMeasureDescriptor,
    stackByAttribute?: IUnwrappedAttributeHeadersWithItems | null,
): ITooltipFactory {
    const { separators, stackMeasuresToPercent = false } = config;

    return (
        point: IUnsafeHighchartsTooltipPoint,
        maxTooltipContentWidth: number,
        percentageValue?: number,
    ): string => {
        const category: ICategory | undefined = point.category;

        const isDualChartWithRightAxis = isDualAxis && isPointOnOppositeAxis(point);
        const formattedValue = getFormattedValueForTooltip(
            isDualChartWithRightAxis,
            stackMeasuresToPercent,
            point,
            separators,
            percentageValue,
        );
        let textData = [[customEscape(point.series?.name), formattedValue]];

        if (stackByAttribute) {
            textData = getTextDataWithStackByAttribute(measure, formattedValue, stackByAttribute, point);
        }

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
    measures: (IMeasureDescriptor | null)[],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    config: IChartConfig = {},
): ITooltipFactory {
    const { separators } = config;

    return (point: IUnsafeHighchartsTooltipPoint, maxTooltipContentWidth: number): string => {
        const textData = [];
        const name = point.name ? point.name : point.series?.name;

        if (stackByAttribute) {
            textData.unshift([customEscape(stackByAttribute.formOf?.name), customEscape(name)]);
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

function decodeAxisLabel(axis: IAxis | undefined): string {
    return decodeHtmlEntities(axis?.label ?? "");
}

function formatAxisValue(
    value: number | undefined,
    axis: IAxis | undefined,
    separators: ISeparators | undefined,
): string {
    return formatValueForTooltip(value, axis?.format, separators) ?? String(value ?? "");
}

export function generateDescriptionXYFn(
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    xAxes: IAxis[] | undefined,
    yAxes: IAxis[] | undefined,
    zAxes: IAxis[] | undefined,
    config: IChartConfig = {},
): IPointDescriptionFn {
    const { separators } = config;
    const attrTitle = decodeHtmlEntities(stackByAttribute?.formOf?.name ?? "");

    return (point: UnsafeInternals): string => {
        const pointName = decodeHtmlEntities(point.name ?? "");
        const xAxisLabel = decodeAxisLabel(xAxes?.[0]);
        const yAxisLabel = decodeAxisLabel(yAxes?.[0]);
        const zAxisLabel = decodeAxisLabel(zAxes?.[0]);
        const xVal = formatAxisValue(point.x, xAxes?.[0], separators);
        const yVal = formatAxisValue(point.y, yAxes?.[0], separators);
        const zVal = formatAxisValue(point.z, zAxes?.[0], separators);

        const namePart = attrTitle && pointName ? `${attrTitle}: ${pointName}` : pointName;

        const parts: string[] = [];
        if (namePart) parts.push(namePart);
        parts.push(xAxisLabel ? `${xAxisLabel}: ${xVal}` : `x: ${xVal}`);
        if (yAxisLabel) parts.push(`${yAxisLabel}: ${yVal}`);
        if (Number.isFinite(point.z)) {
            parts.push(zAxisLabel ? `${zAxisLabel}: ${zVal}` : `z: ${zVal}`);
        }

        return `${parts.join(", ")}.`;
    };
}

export function generateDescriptionScatterPlotFn(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    xAxes: IAxis[] | undefined,
    yAxes: IAxis[] | undefined,
    config: IChartConfig = {},
): IPointDescriptionFn {
    const { separators } = config;
    const attrTitle = decodeHtmlEntities(viewByAttribute?.formOf?.name ?? "");
    const segmentTitle = decodeHtmlEntities(stackByAttribute?.formOf?.name ?? "");

    return (point: UnsafeInternals): string => {
        const pointName = decodeHtmlEntities(point.name ?? "");
        const segmentName = decodeHtmlEntities(point.segmentName ?? "");
        const xAxisLabel = decodeAxisLabel(xAxes?.[0]);
        const yAxisLabel = decodeAxisLabel(yAxes?.[0]);
        const xVal = formatAxisValue(point.x, xAxes?.[0], separators);
        const yVal = formatAxisValue(point.y, yAxes?.[0], separators);

        const namePart = attrTitle && pointName ? `${attrTitle}: ${pointName}` : pointName;

        const parts: string[] = [];
        if (segmentName) {
            parts.push(segmentTitle ? `${segmentTitle}: ${segmentName}` : segmentName);
        }
        if (namePart) parts.push(namePart);
        if (xAxisLabel) parts.push(`${xAxisLabel}: ${xVal}`);
        if (yAxisLabel) parts.push(`${yAxisLabel}: ${yVal}`);

        return `${parts.join(", ")}.`;
    };
}

export function generateTooltipScatterPlotFn(
    measures: (IMeasureDescriptor | null)[],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    config: IChartConfig = {},
    clusterTitle?: string,
): ITooltipFactory {
    const { separators } = config;

    return (point: IUnsafeHighchartsTooltipPoint, maxTooltipContentWidth: number): string => {
        const textData = [];
        const viewByName = point.name ? point.name : point.series?.name;
        const stackByName = point["segmentName"] ? point["segmentName"] : point.series?.name;
        const clusterName = point["clusterName"] ? point["clusterName"] : point.series?.name;

        if (viewByAttribute) {
            textData.unshift([customEscape(viewByAttribute.formOf?.name), customEscape(viewByName)]);
        }

        if (stackByAttribute) {
            textData.unshift([customEscape(stackByAttribute.formOf?.name), customEscape(stackByName)]);
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

        if (config?.clustering?.enabled && clusterName) {
            textData.unshift([clusterTitle, customEscape(clusterName)]);
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function generateTooltipHeatmapFn(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    emptyHeaderTitle: string,
    config: IChartConfig = {},
): ITooltipFactory {
    const { separators } = config;
    const formatValue = (val: number | null | undefined, format: string) => {
        if (val === null || val === undefined) {
            return "-";
        }

        return ClientFormatterFacade.formatValue(val, format, separators).formattedValue;
    };

    return (point: IUnsafeHighchartsTooltipPoint, maxTooltipContentWidth: number): string => {
        const formattedValue = customEscape(
            formatValue(point.value, point.series?.userOptions?.dataLabels?.formatGD),
        );
        const textData: (string | undefined)[][] = [];

        textData.unshift([customEscape(point.series?.name), formattedValue]);

        if (viewByAttribute) {
            textData.unshift([
                customEscape(viewByAttribute.formOf?.name),
                customEscape(
                    valueWithEmptyHandling(
                        getMappingHeaderFormattedName(viewByAttribute.items[point.x!]),
                        emptyHeaderTitle,
                    ),
                ),
            ]);
        }
        if (stackByAttribute) {
            textData.unshift([
                customEscape(stackByAttribute.formOf?.name),
                customEscape(
                    valueWithEmptyHandling(
                        getMappingHeaderFormattedName(stackByAttribute.items[point.y!]),
                        emptyHeaderTitle,
                    ),
                ),
            ]);
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function generateDescriptionHeatmapFn(
    xAxes: IAxis[] | undefined,
    yAxes: IAxis[] | undefined,
    categories: string[][] | undefined,
    valueFormat: string | undefined,
    viewByAttributeTitle: string | undefined,
    config: IChartConfig = {},
): IPointDescriptionFn {
    const { separators } = config;
    const viewByTitle = decodeHtmlEntities(viewByAttributeTitle ?? "");

    return (point: UnsafeInternals): string => {
        const xAxisTitle = decodeHtmlEntities(point.series?.xAxis?.axisTitle?.textStr ?? "");
        const rawCategory = point.category;
        const category = decodeHtmlEntities(
            typeof rawCategory === "object" && rawCategory?.name
                ? rawCategory.name
                : typeof rawCategory === "string"
                  ? rawCategory
                  : "",
        );
        const parentCategory = decodeHtmlEntities(
            typeof rawCategory === "object" ? (rawCategory?.parent?.name ?? "") : "",
        );
        const seriesName = decodeHtmlEntities(point.series.name);

        let xPart: string;
        if (parentCategory && category) {
            const titleParts = xAxisTitle.split(" › ");
            xPart =
                titleParts.length === 2
                    ? `${titleParts[0]}: ${parentCategory}, ${titleParts[1]}: ${category}`
                    : `${parentCategory} › ${category}`;
        } else {
            const effectiveXTitle = xAxisTitle || viewByTitle || decodeAxisLabel(xAxes?.[0]);
            xPart = effectiveXTitle && category ? `${effectiveXTitle}: ${category}` : category;
        }

        const yIdx = typeof point.y === "number" ? point.y : -1;
        const rowCats = categories?.[1];
        const yRaw = yIdx >= 0 && Array.isArray(rowCats) ? rowCats[yIdx] : undefined;
        const yCategory = typeof yRaw === "string" ? decodeHtmlEntities(yRaw) : "";
        const yTitle = decodeAxisLabel(yAxes?.[0]);
        const rawValue = point.value;
        const formattedValue =
            formatValueForTooltip(rawValue, valueFormat, separators) ?? String(rawValue ?? "");

        const parts: string[] = [];
        if (yTitle && yCategory) parts.push(`${yTitle}: ${yCategory}`);
        else if (yCategory) parts.push(yCategory);
        if (xPart) parts.push(xPart);
        parts.push(`${seriesName}: ${formattedValue}`);
        return `${parts.join(", ")}.`;
    };
}

export function buildTooltipTreemapFactory(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    emptyHeaderTitle: string,
    config: IChartConfig = {},
): ITooltipFactory {
    const { separators } = config;

    return (point: IUnsafeHighchartsTooltipPoint, maxTooltipContentWidth: number): string | null => {
        // show tooltip for leaf node only
        if (!point.node || point.node.isLeaf === false) {
            return null;
        }
        const formattedValue = formatValueForTooltip(point.value, point.format, separators);

        const textData = [];

        if (stackByAttribute) {
            textData.push([
                customEscape(stackByAttribute.formOf?.name),
                customEscape(
                    valueWithEmptyHandling(
                        getMappingHeaderFormattedName(stackByAttribute.items[point.y!]),
                        emptyHeaderTitle,
                    ),
                ),
            ]);
        }

        if (viewByAttribute) {
            textData.unshift([
                customEscape(viewByAttribute.formOf?.name),
                customEscape(
                    valueWithEmptyHandling(
                        getMappingHeaderFormattedName(viewByAttribute.items[point.x!]),
                        emptyHeaderTitle,
                    ),
                ),
            ]);
            textData.push([customEscape(point.series?.name), formattedValue]);
        } else {
            textData.push([customEscape(point.category?.name), formattedValue]);
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function generateDescriptionTreemapFn(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    yAxes: IAxis[] | undefined,
    config: IChartConfig = {},
): IPointDescriptionFn {
    const { separators } = config;
    const hasStackByAttribute = Boolean(stackByAttribute);
    const stackByTitle = decodeHtmlEntities(hasStackByAttribute ? (viewByAttribute?.formOf?.name ?? "") : "");
    const viewByTitle = decodeHtmlEntities(hasStackByAttribute ? "" : (viewByAttribute?.formOf?.name ?? ""));
    const segmentByTitle = decodeHtmlEntities(stackByAttribute?.formOf?.name ?? "");
    const measureName = decodeAxisLabel(yAxes?.[0]);

    return (point: UnsafeInternals): string => {
        const pointName = decodeHtmlEntities(point.name ?? "");
        const seriesName = decodeHtmlEntities(point.series.name);
        const rawValue = point.value;
        const yValue = formatValueForTooltip(rawValue, point.format, separators) ?? String(rawValue ?? "");

        const hasParent = point.parent !== undefined && point.parent !== "";
        if (!hasParent && point.value == null) {
            return "";
        }
        if (hasParent) {
            const seriesPoints = point.series.points as UnsafeInternals[];
            const parentPoint = seriesPoints?.find((p: UnsafeInternals) => p.id === point.parent);
            const segmentName = decodeHtmlEntities(parentPoint?.name ?? "");
            if (segmentByTitle && pointName) {
                const parts: string[] = [];
                if (stackByTitle && segmentName) {
                    parts.push(`${stackByTitle}: ${segmentName}`);
                }
                parts.push(`${segmentByTitle}: ${pointName}`);
                const valueName = stackByTitle
                    ? measureName || seriesName
                    : segmentName || measureName || seriesName;
                parts.push(`${valueName}: ${yValue}`);
                return `${parts.join(", ")}.`;
            }
            if (viewByTitle && segmentName) {
                return `${viewByTitle}: ${segmentName}, ${measureName || seriesName}: ${yValue}.`;
            }
            return segmentName ? `${segmentName}: ${yValue}.` : `${measureName || seriesName}: ${yValue}.`;
        }
        if (pointName) {
            const dimTitle = viewByTitle || stackByTitle;
            return dimTitle
                ? `${dimTitle}: ${pointName}, ${measureName || seriesName}: ${yValue}.`
                : `${pointName}: ${yValue}.`;
        }
        return `${seriesName}: ${yValue}.`;
    };
}

export function generateTooltipSankeyChartFn(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    measure: IMeasureDescriptor,
    config: IChartConfig = {},
): ITooltipFactory {
    const { separators } = config;

    return (point: IUnsafeHighchartsTooltipPoint, maxTooltipContentWidth: number): string => {
        const textData: (string | undefined)[][] = [];
        const format = unwrap(measure).format;

        if (point.isNode) {
            const formattedValue = formatValueForTooltip(point.sum ?? 0, format, separators);
            if (point.name) {
                textData.push(["", point.name]);
            }
            textData.push([measure.measureHeaderItem.name, formattedValue]);
        } else {
            const formattedValue = formatValueForTooltip(point.weight, format, separators);
            textData.push([viewByParentAttribute?.formOf?.name, point.from]);
            textData.push([viewByAttribute?.formOf?.name, point.to]);
            textData.push([measure.measureHeaderItem.name, formattedValue]);
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function getTooltipWaterfallChart(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    config: IChartConfig = {},
) {
    const { separators } = config;

    return (
        point: IUnsafeHighchartsTooltipPoint,
        maxTooltipContentWidth: number,
        percentageValue?: number,
    ): string => {
        const formattedValue = getFormattedValueForTooltip(false, false, point, separators, percentageValue);
        const isNormalDataPoint = viewByAttribute && !point?.["isSum"];
        const textData = [
            [customEscape(isNormalDataPoint ? point.series?.name : point.name), formattedValue],
        ];

        if (isNormalDataPoint) {
            textData.unshift([
                customEscape(viewByAttribute.formOf.name),
                customEscape(point.category?.name || point.name),
            ]);
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function getTooltipFactory(
    isViewByTwoAttributes: boolean,
    viewByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems | undefined | null,
    measure: IMeasureDescriptor | undefined,
    emptyHeaderTitle: string,
    config: IChartConfig = {},
    isDualAxis: boolean = false,
): ITooltipFactory {
    const { type } = config;
    if (isTreemap(type)) {
        return buildTooltipTreemapFactory(viewByAttribute, stackByAttribute, emptyHeaderTitle, config);
    }
    if (isViewByTwoAttributes) {
        return buildTooltipForTwoAttributesFactory(
            viewByAttribute,
            viewByParentAttribute,
            config,
            isDualAxis,
            measure,
            stackByAttribute,
        );
    }
    return buildTooltipFactory(viewByAttribute, type, config, isDualAxis, measure, stackByAttribute);
}
