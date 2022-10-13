// (C) 2007-2022 GoodData Corporation
import { ITheme, IMeasureDescriptor, IMeasureGroupDescriptor } from "@gooddata/sdk-model";
import { IUnwrappedAttributeHeadersWithItems } from "../../typings/mess";
import { IColorStrategy, valueWithEmptyHandling } from "@gooddata/sdk-ui-vis-commons";
import { IPointData, ISeriesItemConfig } from "../../typings/unsafe";
import {
    isBubbleChart,
    isBulletChart,
    isHeatmap,
    isOneOfTypes,
    isScatterPlot,
    isTreemap,
    parseValue,
    unwrap,
} from "../_util/common";
import { multiMeasuresAlternatingTypes } from "./chartCapabilities";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { getHeatmapSeries } from "../heatmap/heatmapChartSeries";
import { getScatterPlotSeries } from "../scatterPlot/scatterPlotSeries";
import { getBubbleChartSeries } from "../bubbleChart/bubbleChartSeries";
import { getTreemapStackedSeries } from "../treemap/treemapChartSeries";
import { getBulletChartSeries } from "../bulletChart/bulletChartSeries";

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

function getDefaultSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: string,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
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
            );

            const seriesItemConfig: ISeriesItemConfig = {
                color: colorStrategy.getColorByIndex(seriesIndex),
                legendIndex: seriesIndex,
                data: seriesItemData,
                seriesIndex,
            };

            if (stackByAttribute) {
                // if stackBy attribute is available, seriesName is a stackBy attribute value of index seriesIndex
                // this is a limitiation of highcharts and a reason why you can not have multi-measure stacked charts
                seriesItemConfig.name = valueWithEmptyHandling(
                    stackByAttribute.items[seriesIndex].attributeHeaderItem.name,
                    emptyHeaderTitle,
                );
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

export function getSeries(
    dv: DataViewFacade,
    measureGroup: IMeasureGroupDescriptor["measureGroupHeader"],
    viewByAttribute: IUnwrappedAttributeHeadersWithItems,
    stackByAttribute: IUnwrappedAttributeHeadersWithItems,
    type: string,
    colorStrategy: IColorStrategy,
    emptyHeaderTitle: string,
    theme?: ITheme,
): any {
    if (isHeatmap(type)) {
        return getHeatmapSeries(dv, measureGroup, theme);
    } else if (isScatterPlot(type)) {
        return getScatterPlotSeries(dv, stackByAttribute, colorStrategy, emptyHeaderTitle);
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
    }

    return getDefaultSeries(
        dv,
        measureGroup,
        viewByAttribute,
        stackByAttribute,
        type,
        colorStrategy,
        emptyHeaderTitle,
    );
}
