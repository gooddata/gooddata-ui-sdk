// (C) 2007-2023 GoodData Corporation
import { IColorPalette, ITheme } from "@gooddata/sdk-model";
import { DataViewFacade, DefaultColorPalette, VisualizationTypes } from "@gooddata/sdk-ui";
import { IColorMapping } from "../../../interfaces/index.js";
import {
    isBubbleChart,
    isBulletChart,
    isHeatmap,
    isOneOfTypes,
    isSankeyOrDependencyWheel,
    isScatterPlot,
    isTreemap,
    isWaterfall,
} from "../_util/common.js";
import BulletChartColorStrategy from "../bulletChart/bulletChartColoring.js";
import { MeasureColorStrategy } from "../_chartColoring/measure.js";
import { AttributeColorStrategy, IColorStrategy } from "@gooddata/sdk-ui-vis-commons";
import { HeatmapColorStrategy } from "../heatmap/heatmapColoring.js";
import { TreemapColorStrategy } from "../treemap/treemapColoring.js";
import { BubbleChartColorStrategy } from "../bubbleChart/bubbleChartColoring.js";
import { ScatterPlotColorStrategy } from "../scatterPlot/scatterPlotColoring.js";
import { SankeyChartColorStrategy } from "../sankeyChart/sankeyChartColoring.js";
import { WaterfallChartColorStrategy } from "../waterfallChart/waterfallChartColoring.js";

const attributeChartSupportedTypes = [
    VisualizationTypes.PIE,
    VisualizationTypes.DONUT,
    VisualizationTypes.FUNNEL,
    VisualizationTypes.PYRAMID,
    VisualizationTypes.SCATTER,
    VisualizationTypes.BUBBLE,
    VisualizationTypes.SANKEY,
    VisualizationTypes.DEPENDENCY_WHEEL,
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
        viewByParentAttribute: any,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        stackByAttribute: any,
        dv: DataViewFacade,
        type: string,
        theme?: ITheme,
    ): IColorStrategy {
        if (isHeatmap(type)) {
            return new HeatmapColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                theme,
            );
        }

        if (isTreemap(type)) {
            return new TreemapColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                theme,
            );
        }

        if (isScatterPlot(type)) {
            return new ScatterPlotColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                theme,
            );
        }

        if (isBubbleChart(type)) {
            return new BubbleChartColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                theme,
            );
        }

        if (isBulletChart(type)) {
            return new BulletChartColorStrategy(
                colorPalette,
                colorMapping,
                viewByAttribute,
                stackByAttribute,
                dv,
                theme,
            );
        }

        if (isSankeyOrDependencyWheel(type)) {
            return new SankeyChartColorStrategy(
                colorPalette,
                colorMapping,
                viewByParentAttribute,
                viewByAttribute,
                dv,
                theme,
            );
        }

        if (isWaterfall(type)) {
            return new WaterfallChartColorStrategy(
                colorPalette,
                colorMapping,
                viewByParentAttribute,
                viewByAttribute,
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
                theme,
            );
        }

        return new MeasureColorStrategy(
            colorPalette,
            colorMapping,
            viewByAttribute,
            stackByAttribute,
            dv,
            theme,
        );
    }
}
