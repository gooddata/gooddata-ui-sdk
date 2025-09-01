// (C) 2007-2025 GoodData Corporation
import { IMeasureGroupDescriptor, ITheme } from "@gooddata/sdk-model";
import { DataViewFacade, getMappingHeaderFormattedName } from "@gooddata/sdk-ui";
import { ChartFill, IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";

import { multiMeasuresAlternatingTypes } from "./chartCapabilities.js";
import { getChartFillProperties } from "./patternFillOptions.js";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess.js";
import { IPointData, ISeriesItemConfig } from "../../typings/unsafe.js";
import {
    isBubbleChart,
    isBulletChart,
    isHeatmap,
    isOneOfTypes,
    isSankeyOrDependencyWheel,
    isScatterPlot,
    isTreemap,
    isWaterfall,
    parseValue,
    unwrap,
} from "../_util/common.js";
import { getBubbleChartSeries } from "../bubbleChart/bubbleChartSeries.js";
import { getBulletChartSeries } from "../bulletChart/bulletChartSeries.js";
import { getHeatmapSeries } from "../heatmap/heatmapChartSeries.js";
import { buildSankeyChartSeries } from "../sankeyChart/sankeyChartOptions.js";
import { getScatterPlotSeries } from "../scatterPlot/scatterPlotSeries.js";
import { getTreemapStackedSeries } from "../treemap/treemapChartSeries.js";
import { getWaterfallChartSeries } from "../waterfallChart/waterfallChartsSeries.js";

export function getSeriesItemData(
    seriesItem: string[],
    seriesIndex: number,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: string,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
    chartFill: ChartFill | undefined,
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
            pointData.name = valueWithEmptyHandling(
                getMappingHeaderFormattedName(stackByAttribute.items[seriesIndex]),
                emptyHeaderTitle,
            );
        } else if (isOneOfTypes(type, multiMeasuresAlternatingTypes) && viewByAttribute) {
            pointData.name = valueWithEmptyHandling(
                getMappingHeaderFormattedName(viewByAttribute.items[viewByIndex]),
                emptyHeaderTitle,
            );
        } else {
            pointData.name = valueWithEmptyHandling(
                unwrap(measureGroup.items[measureIndex]).name,
                emptyHeaderTitle,
            );
        }

        if (isOneOfTypes(type, multiMeasuresAlternatingTypes)) {
            const baseColor = colorStrategy.getColorByIndex(pointIndex);
            const { color, borderColor } = getChartFillProperties(chartFill, baseColor, pointIndex);
            pointData.color = color;
            pointData.borderColor = borderColor;
            // Pie and Treemap charts use pointData viewByIndex as legendIndex if available
            // instead of seriesItem legendIndex
            pointData.legendIndex = viewByAttribute ? viewByIndex : pointIndex;
        }

        return pointData;
    });
}

function getDefaultSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: string,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
    chartFill: ChartFill | undefined,
): ISeriesItemConfig[] {
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
                emptyHeaderTitle,
                chartFill,
            );

            const baseColor = colorStrategy.getColorByIndex(seriesIndex);
            const colorProperties = getChartFillProperties(chartFill, baseColor, seriesIndex);

            const seriesItemConfig: ISeriesItemConfig = {
                ...colorProperties,
                legendIndex: seriesIndex,
                data: seriesItemData,
                seriesIndex,
            };

            if (stackByAttribute) {
                // if stackBy attribute is available, seriesName is a stackBy attribute value of index seriesIndex
                // this is a limitation of highcharts and a reason why you can not have multi-measure stacked charts
                seriesItemConfig.name = valueWithEmptyHandling(
                    getMappingHeaderFormattedName(stackByAttribute.items[seriesIndex]),
                    emptyHeaderTitle,
                );
            } else if (isOneOfTypes(type, multiMeasuresAlternatingTypes) && !viewByAttribute) {
                // Pie charts with measures only have a single series which name would is ambiguous
                seriesItemConfig.name = measureGroup.items
                    .map((wrappedMeasure) =>
                        valueWithEmptyHandling(unwrap(wrappedMeasure).name, emptyHeaderTitle),
                    )
                    .join(", ");
            } else {
                // otherwise seriesName is a measure name of index seriesIndex
                seriesItemConfig.name = valueWithEmptyHandling(
                    measureGroup.items[seriesIndex].measureHeaderItem.name,
                    emptyHeaderTitle,
                );
            }

            const turboThresholdProp = isTreemap(type) ? { turboThreshold: 0 } : {};

            return {
                ...seriesItemConfig,
                ...turboThresholdProp,
            };
        });
}

export function getSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    viewByParentAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: string,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
    theme: ITheme | undefined,
    chartFill: ChartFill | undefined,
): any {
    if (isHeatmap(type)) {
        return getHeatmapSeries(dv, measureGroup, theme);
    } else if (isScatterPlot(type)) {
        return getScatterPlotSeries(dv, viewByAttribute, stackByAttribute, colorStrategy, emptyHeaderTitle);
    } else if (isBubbleChart(type)) {
        return getBubbleChartSeries(dv, measureGroup, stackByAttribute, colorStrategy, emptyHeaderTitle);
    } else if (isTreemap(type) && stackByAttribute) {
        return getTreemapStackedSeries(
            dv,
            measureGroup,
            viewByAttribute,
            stackByAttribute,
            colorStrategy,
            emptyHeaderTitle,
        );
    } else if (isBulletChart(type)) {
        return getBulletChartSeries(dv, measureGroup, colorStrategy);
    } else if (isSankeyOrDependencyWheel(type)) {
        return buildSankeyChartSeries(
            dv,
            [viewByParentAttribute, viewByAttribute],
            colorStrategy,
            emptyHeaderTitle,
        );
    } else if (isWaterfall(type)) {
        return getWaterfallChartSeries(
            dv,
            measureGroup,
            viewByAttribute,
            colorStrategy,
            emptyHeaderTitle,
            chartFill,
        );
    }

    return getDefaultSeries(
        dv,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        type,
        colorStrategy,
        emptyHeaderTitle,
        chartFill,
    );
}
