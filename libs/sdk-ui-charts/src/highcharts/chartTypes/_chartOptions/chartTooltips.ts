// (C) 2007-2022 GoodData Corporation
import { IChartConfig } from "../../../interfaces";
import { colors2Object, numberFormat } from "@gooddata/numberjs";
import { ICategory, IUnsafeHighchartsTooltipPoint, ITooltipFactory } from "../../typings/unsafe";
import { customEscape, isCssMultiLineTruncationSupported, isOneOfTypes, isTreemap } from "../_util/common";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess";
import { formatValueForTooltip, getFormattedValueForTooltip } from "./tooltip";
import { multiMeasuresAlternatingTypes } from "./chartCapabilities";
import cx from "classnames";
import { IMeasureDescriptor } from "@gooddata/sdk-model";

const TOOLTIP_PADDING = 10;

const renderTooltipHTML = (textData: string[][], maxTooltipContentWidth: number): string => {
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

function isPointOnOppositeAxis(point: IUnsafeHighchartsTooltipPoint): boolean {
    return point.series?.yAxis.opposite ?? false;
}

function getMeasureTextData(measure: IMeasureDescriptor, formattedValue: string) {
    if (measure) {
        return [[customEscape(measure.measureHeaderItem.name), formattedValue]];
    }
    return [];
}

function getTextDataWithStackByAttribute(
    measure: IMeasureDescriptor,
    formattedValue: string,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    point: IUnsafeHighchartsTooltipPoint,
) {
    const textData = getMeasureTextData(measure, formattedValue);
    textData.unshift([
        customEscape(stackByAttribute.formOf.name),
        customEscape(customEscape(point.series.name)),
    ]);
    return textData;
}

export function buildTooltipFactory(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: string,
    config: IChartConfig = {},
    isDualAxis: boolean = false,
    measure?: IMeasureDescriptor,
    stackByAttribute?: IUnwrappedAttributeHeadersWithItems,
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
        let textData = [[customEscape(point.series.name), formattedValue]];

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
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems,
    config: IChartConfig = {},
    isDualAxis: boolean = false,
    measure?: IMeasureDescriptor,
    stackByAttribute?: IUnwrappedAttributeHeadersWithItems,
): ITooltipFactory {
    const { separators, stackMeasuresToPercent = false } = config;

    return (
        point: IUnsafeHighchartsTooltipPoint,
        maxTooltipContentWidth: number,
        percentageValue?: number,
    ): string => {
        const category: ICategory = point.category;

        const isDualChartWithRightAxis = isDualAxis && isPointOnOppositeAxis(point);
        const formattedValue = getFormattedValueForTooltip(
            isDualChartWithRightAxis,
            stackMeasuresToPercent,
            point,
            separators,
            percentageValue,
        );
        let textData = [[customEscape(point.series.name), formattedValue]];

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
    measures: IMeasureDescriptor[],
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    config: IChartConfig = {},
): ITooltipFactory {
    const { separators } = config;

    return (point: IUnsafeHighchartsTooltipPoint, maxTooltipContentWidth: number): string => {
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
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    emptyHeaderName: string,
    config: IChartConfig = {},
): ITooltipFactory {
    const { separators } = config;
    const formatValue = (val: number, format: string) => {
        return colors2Object(val === null ? "-" : numberFormat(val, format, undefined, separators));
    };

    return (point: IUnsafeHighchartsTooltipPoint, maxTooltipContentWidth: number): string => {
        const formattedValue = customEscape(
            formatValue(point.value, point.series.userOptions.dataLabels.formatGD).label,
        );
        const textData = [];

        textData.unshift([customEscape(point.series.name), formattedValue]);

        if (viewByAttribute) {
            textData.unshift([
                customEscape(viewByAttribute.formOf.name),
                customEscape(viewByAttribute.items[point.x].attributeHeaderItem.name || emptyHeaderName), // TODO RAIL-4360 distinguish between empty and null
            ]);
        }
        if (stackByAttribute) {
            textData.unshift([
                customEscape(stackByAttribute.formOf.name),
                customEscape(stackByAttribute.items[point.y].attributeHeaderItem.name || emptyHeaderName), // TODO RAIL-4360 distinguish between empty and null
            ]);
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function buildTooltipTreemapFactory(
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    emptyHeaderName: string,
    config: IChartConfig = {},
): ITooltipFactory {
    const { separators } = config;

    return (point: IUnsafeHighchartsTooltipPoint, maxTooltipContentWidth: number) => {
        // show tooltip for leaf node only
        if (!point.node || point.node.isLeaf === false) {
            return null;
        }
        const formattedValue = formatValueForTooltip(point.value, point.format, separators);

        const textData = [];

        if (stackByAttribute) {
            textData.push([
                customEscape(stackByAttribute.formOf.name),
                customEscape(stackByAttribute.items[point.y].attributeHeaderItem.name || emptyHeaderName), // TODO RAIL-4360 distinguish between empty and null
            ]);
        }

        if (viewByAttribute) {
            textData.unshift([
                customEscape(viewByAttribute.formOf.name),
                customEscape(viewByAttribute.items[point.x].attributeHeaderItem.name || emptyHeaderName), // TODO RAIL-4360 distinguish between empty and null
            ]);
            textData.push([customEscape(point.series.name), formattedValue]);
        } else {
            textData.push([customEscape(point.category?.name), formattedValue]);
        }

        return renderTooltipHTML(textData, maxTooltipContentWidth);
    };
}

export function getTooltipFactory(
    isViewByTwoAttributes: boolean,
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    measure: IMeasureDescriptor,
    emptyHeaderName: string,
    config: IChartConfig = {},
    isDualAxis: boolean = false,
): ITooltipFactory {
    const { type } = config;
    if (isTreemap(type)) {
        return buildTooltipTreemapFactory(viewByAttribute, stackByAttribute, emptyHeaderName, config);
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
