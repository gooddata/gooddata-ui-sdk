// (C) 2007-2020 GoodData Corporation
import { IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade, DefaultColorPalette, VisualizationTypes } from "@gooddata/sdk-ui";
import { IColorMapping } from "../../interfaces";
import {
    isBubbleChart,
    isBulletChart,
    isHeatmap,
    isOneOfTypes,
    isScatterPlot,
    isTreemap,
} from "../utils/common";
import BulletChartColorStrategy from "./colorStrategies/bulletChart";
import { MeasureColorStrategy } from "./colorStrategies/measure";
import { AttributeColorStrategy, IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { HeatmapColorStrategy } from "./colorStrategies/heatmap";
import { TreemapColorStrategy } from "./colorStrategies/treemap";
import { BubbleChartColorStrategy } from "./colorStrategies/bubbleChart";
import { ScatterPlotColorStrategy } from "./colorStrategies/scatterPlot";

const attributeChartSupportedTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.SCATTER,
    VisualizationTypes.BUBBLE,
];

function isAttributeColorPalette(type: string, dv: DataViewFacade, stackByAttribute: any) {
    const attributeChartSupported = isOneOfTypes(type, attributeChartSupportedTypes);
    return stackByAttribute || (attributeChartSupported && dv.def().hasAttributes());
}

export class ColorFactory {
    public static getColorStrategy(
        colorPalette: IColorPalette = DefaultColorPalette,
        colorMapping: IColorMapping[],
        viewByAttribute: any,
        stackByAttribute: any,
        dv: DataViewFacade,
        type: string,
    ): IColorStrategy {
        if (isHeatmap(type)) {
            return new HeatmapColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
            );
        }

        if (isTreemap(type)) {
            return new TreemapColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
            );
        }

        if (isScatterPlot(type)) {
            return new ScatterPlotColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
            );
        }

        if (isBubbleChart(type)) {
            return new BubbleChartColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
            );
        }

        if (isBulletChart(type)) {
            return new BulletChartColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
            );
        }

        if (isAttributeColorPalette(type, dv, stackByAttribute)) {
            return new AttributeColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
            );
        }

        return new MeasureColorStrategy(colorPalette, colorMapping, viewByAttribute, stackByAttribute, dv);
    }
}
