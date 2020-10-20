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
} from "./utils/common";
import BulletChartColorStrategy from "../chartTypes/bulletChart/bulletChartColoring";
import { MeasureColorStrategy } from "../chartTypes/_common/colorStrategies/measure";
import { AttributeColorStrategy, IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { HeatmapColorStrategy } from "../chartTypes/heatmap/heatmapColoring";
import { TreemapColorStrategy } from "../chartTypes/treemap/treemapColoring";
import { BubbleChartColorStrategy } from "../chartTypes/bubbleChart/bubbleChartColoring";
import { ScatterPlotColorStrategy } from "../chartTypes/scatterPlot/scatterPlotColoring";

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
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        viewByAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
